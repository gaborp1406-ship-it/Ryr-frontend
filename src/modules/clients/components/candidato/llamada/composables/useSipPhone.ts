import { ref } from "vue";
import { useToast } from "vue-toastification";
import * as SIP from "sip.js";
import { obtenerCredencialesSip } from "../actions/Gestioninteraction.action.js";

export interface ISipCredentials {
  agentExtension: string;
  sipUsername: string;
  sipServer: string;
  sipPort: string;
  agentPassword: string;
}

// Conecta el track remoto (audio del cliente) al <audio id="remoteAudio">
function configurarAudioRemoto(invitation: any) {
  try {
    const pc = invitation.sessionDescriptionHandler?.peerConnection;
    const audio = document.getElementById("remoteAudio") as HTMLAudioElement | null;
    const remoteStream = new MediaStream();

    if (!audio) {
      console.warn('⚠️ No se encontró el elemento <audio id="remoteAudio">');
    }

    if (!pc) {
      console.warn("⚠️ No se encontró peerConnection");
      return;
    }

    const reproducir = () => {
      if (!audio) return;
      audio.srcObject = remoteStream;
      audio.play().catch((err) => console.warn("⚠️ Autoplay bloqueado:", err));
    };

    pc.ontrack = (event: RTCTrackEvent) => {
      console.log("🔊 Track remoto recibido:", event.track.kind);
      remoteStream.addTrack(event.track);
      reproducir();
    };

    pc.getReceivers().forEach((receiver: any) => {
      if (receiver.track) remoteStream.addTrack(receiver.track);
    });

    if (remoteStream.getTracks().length > 0) reproducir();
  } catch (error) {
    console.warn("⚠️ No se pudo configurar el audio remoto", error);
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
    console.log("📞 Llamada entrante");
    currentSession.value = invitation;

    try {
      await invitation.accept({
        sessionDescriptionHandlerOptions: {
          constraints: { audio: true, video: false },
        },
      });

      configurarAudioRemoto(invitation);

      invitation.stateChange.addListener((state: any) => {
        if (state === SIP.SessionState.Established) {
          console.log("✅ Agente conectado al bridge");
        }
        if (state === SIP.SessionState.Terminated) {
          console.log("📴 Llamada finalizada (SIP)");
          currentSession.value = null;
        }
      });
    } catch (error) {
      console.error("❌ Error aceptando llamada:", error);
    }
  };

  const registrarUserAgent = async (credentials: ISipCredentials) => {
    if (userAgent.value) {
      console.log("ℹ️ SIP ya inicializado");
      return;
    }

    const sipUri = `sip:${credentials.agentExtension}@${credentials.sipServer}`;
    const wsServer = `ws://${credentials.sipServer}:${credentials.sipPort}/ws`;

    console.log("====================================");
    console.log("📞 CONFIGURANDO SIP.JS");
    console.log("👤 Usuario:", credentials.agentExtension);
    console.log("🌐 SIP URI:", sipUri);
    console.log("🔌 WebSocket:", wsServer);
    console.log("====================================");

    const uri = SIP.UserAgent.makeURI(sipUri);

    if (!uri) {
      throw new Error(`URI SIP inválida: ${sipUri}`);
    }

    userAgent.value = new SIP.UserAgent({
      uri,

      transportOptions: {
        server: `ws://${credentials.sipServer}:8088/ws`,
        keepAliveInterval: 15,
      },

      authorizationUsername: credentials.agentExtension,
      authorizationPassword: credentials.agentPassword,

      sessionDescriptionHandlerFactoryOptions: {
        constraints: {
          audio: true,
          video: false,
        },
      },

      delegate: {
        onInvite: manejarLlamadaEntrante,

        onDisconnect: (error: any) => {
          console.error("❌ SIP WebSocket desconectado:", error);
          sipRegistrado.value = false;
        },
      },
    });

    registerer.value = new SIP.Registerer(userAgent.value);

    console.log("🚀 Iniciando SIP UserAgent...");

    await userAgent.value.start();

    console.log("✅ WebSocket SIP conectado");

    console.log("📝 Registrando extensión...");

    await registerer.value.register();

    console.log(
      `✅ Agente ${credentials.agentExtension} registrado correctamente`,
    );

    sipRegistrado.value = true;

    toast.success(
      `Agente ${credentials.agentExtension} conectado`,
    );
  };

  // Obtiene las credenciales SIP y registra el softphone.
  // Devuelve las credenciales para que quien la llame pueda abrir el SSE de eventos.
  const conectarTelefono = async (): Promise<ISipCredentials> => {
    cargandoTelefono.value = true;

    try {
      const credenciales = await obtenerCredencialesSip();

      sipCredentials.value = {
        agentExtension: credenciales.agentExtension,
        sipUsername: credenciales.sipUsername,
        sipServer: credenciales.sipServer,
        sipPort: credenciales.sipPort,
        agentPassword: credenciales.sipPassword,
      };

      await registrarUserAgent(sipCredentials.value);
      sipRegistrado.value = true;

      return sipCredentials.value;
    } catch (error) {
      userAgent.value = null;
      registerer.value = null;
      currentSession.value = null;

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