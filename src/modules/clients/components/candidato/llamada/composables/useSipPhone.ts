import { ref } from "vue";
import { useToast } from "vue-toastification";
import * as SIP from "sip.js";
import { obtenerCredencialesSip } from "../actions/Gestioninteraction.action.js";

export interface ISipCredentials {
  agentExtension: string;
  sipServer: string;
  sipPort: string;
  agentPassword: string;
}

// Conecta el track remoto (audio del cliente) al <audio id="remoteAudio">
function configurarAudioRemoto(invitation: any) {
  try {
    const audio = document.getElementById("remoteAudio") as HTMLAudioElement | null;

    if (!audio) {
      console.warn("⚠️ No existe #remoteAudio");
      return;
    }

    const sessionDescriptionHandler = invitation.sessionDescriptionHandler;

    if (!sessionDescriptionHandler) {
      console.warn("⚠️ No existe SessionDescriptionHandler");
      return;
    }

    const pc = sessionDescriptionHandler.peerConnection;

    if (!pc) {
      console.warn("⚠️ No existe PeerConnection");
      return;
    }

    const remoteStream = new MediaStream();

    pc.getReceivers().forEach((receiver: RTCRtpReceiver) => {
      if (receiver.track) {
        console.log("🔊 Receiver encontrado:", receiver.track.kind);
        remoteStream.addTrack(receiver.track);
      }
    });

    pc.ontrack = (event: RTCTrackEvent) => {
      console.log("🔊 TRACK REMOTO:", event.track.kind);
      remoteStream.addTrack(event.track);
      audio.srcObject = remoteStream;
      audio.play()
        .then(() => console.log("🔊 Audio remoto reproduciéndose (ontrack)"))
        .catch((error) => console.warn("⚠️ No se pudo reproducir audio (ontrack):", error));
    };

    audio.srcObject = remoteStream;

    // 👇 FIX: forzar play() también acá, no solo dentro de ontrack
    audio.play()
      .then(() => console.log("🔊 Audio remoto reproduciéndose (inicial)"))
      .catch((error) => console.warn("⚠️ No se pudo reproducir audio (inicial):", error));

    console.log("🎧 Audio remoto configurado");

  } catch (error) {
    console.error("❌ Error configurando audio remoto:", error);
  }
}
// Maneja el registro del softphone (SIP.js) y las llamadas entrantes (bridge del agente)
export function useSipPhone() {
  const toast = useToast();

  const userAgent = ref<any>(null);
  const registerer = ref<any>(null);
  const currentSession = ref<any>(null);

  const cargandoTelefono = ref(false);
  const sipRegistrado = ref(false);
  const sipCredentials = ref<ISipCredentials | null>(null);

  const manejarLlamadaEntrante = async (invitation: any) => {
    console.log("=================================");
    console.log("📞 INVITE RECIBIDO");
    console.log("=================================");

    currentSession.value = invitation;

    invitation.stateChange.addListener((state: any) => {
      console.log("📡 SIP STATE:", state);

      if (state === SIP.SessionState.Establishing) {
        console.log("🔄 ESTABLISHING");
      }

      if (state === SIP.SessionState.Established) {
        console.log("✅ ESTABLISHED");
      }

      if (state === SIP.SessionState.Terminated) {
        console.log("❌ TERMINATED");
        currentSession.value = null;
      }
    });

    try {
      console.log("📞 Ejecutando invitation.accept()...");

      await invitation.accept({
        sessionDescriptionHandlerOptions: {
          constraints: {
            audio: true,
            video: false,
          },
        },
      });

      console.log("✅ invitation.accept() TERMINÓ");

      configurarAudioRemoto(invitation);

    } catch (error) {
      console.error("❌ invitation.accept() FALLÓ:", error);
    }
  };

  const registrarUserAgent = async (credentials: ISipCredentials) => {
    if (userAgent.value) {
      console.log("ℹ️ SIP ya inicializado");
      return;
    }

    userAgent.value = new SIP.UserAgent({
      uri: SIP.UserAgent.makeURI(`sip:${credentials.agentExtension}@${credentials.sipServer}`),
      transportOptions: {
        server: `ws://${credentials.sipServer}:${credentials.sipPort}/ws`,
        keepAliveInterval: 15,
      },
      authorizationUsername: credentials.agentExtension,
      authorizationPassword: credentials.agentPassword,
      sessionDescriptionHandlerFactoryOptions: {
        constraints: { audio: true, video: false },
      },
    });

    userAgent.value.delegate = {
      onInvite: manejarLlamadaEntrante,
    };

    registerer.value = new SIP.Registerer(userAgent.value);

    await userAgent.value.start();

    // 👇 FIX: esperar el estado "Registered" real, no solo el envío del REGISTER
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timeout esperando confirmación de registro SIP"));
      }, 10000);

      registerer.value.stateChange.addListener((state: SIP.RegistererState) => {
        console.log("📋 Registerer state:", state);

        if (state === SIP.RegistererState.Registered) {
          clearTimeout(timeout);
          resolve();
        }

        if (state === SIP.RegistererState.Unregistered) {
          clearTimeout(timeout);
          reject(new Error("El registro SIP fue rechazado"));
        }
      });

      registerer.value.register().catch((err: any) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    console.log(`✅ Agente ${credentials.agentExtension} registrado correctamente (confirmado)`);
    toast.success(`Agente ${credentials.agentExtension} conectado`);
  };

  // Obtiene las credenciales SIP y registra el softphone.
  // Devuelve las credenciales para que quien la llame pueda abrir el SSE de eventos.
  const conectarTelefono = async (): Promise<ISipCredentials> => {
    cargandoTelefono.value = true;

    try {
      const credenciales = await obtenerCredencialesSip();

      sipCredentials.value = {
        agentExtension: credenciales.sipUsername,   // ✅ corregido
        sipServer: credenciales.sipServer,
        sipPort: credenciales.sipPort,
        agentPassword: credenciales.sipPassword,     // ✅ corregido
      };



      await registrarUserAgent(sipCredentials.value);

      // 👇 Ahora sí es seguro marcarlo true: ya llegó el 200 OK del REGISTER
      sipRegistrado.value = true;

      return sipCredentials.value;
    } catch (error) {
      console.error("❌ Error conectando teléfono:", error);

      userAgent.value = null;
      registerer.value = null;
      currentSession.value = null;
      sipRegistrado.value = false; // 👈 asegurate de resetear esto también

      toast.error("Error registrando el teléfono");
      throw error;
    } finally {
      cargandoTelefono.value = false;
    }
  };

  return {
    sipCredentials,
    sipRegistrado,
    cargandoTelefono,
    conectarTelefono,
  };
}