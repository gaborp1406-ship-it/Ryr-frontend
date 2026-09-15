import { ref } from "vue";
import { useToast } from "vue-toastification";
import * as SIP from "sip.js";
import { obtenerCredencialesSip } from "../actions/Gestioninteraction.action";

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
        remoteStream.addTrack(receiver.track);
      }
    });

    pc.ontrack = (event: RTCTrackEvent) => {
      remoteStream.addTrack(event.track);
      audio.srcObject = remoteStream;
      audio.play()
        .then(() => console.log("🔊 Audio remoto reproduciéndose (ontrack)"))
        .catch((error) => console.warn("⚠️ No se pudo reproducir audio (ontrack):", error));
    };

    audio.srcObject = remoteStream;

    audio.play()
      .then(() => console.log("🔊 Audio remoto reproduciéndose (inicial)"))
      .catch((error) => console.warn("⚠️ No se pudo reproducir audio (inicial):", error));

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

  // Estado del micrófono
  const micSilenciado = ref(false);

  // Silencia/reactiva el MICRÓFONO LOCAL (lo que el agente envía) de la llamada activa
  function toggleMic() {
    const session = currentSession.value;

    if (!session || !session.sessionDescriptionHandler) {
      toast.warning("No hay una llamada activa para silenciar.");
      return;
    }

    const pc = session.sessionDescriptionHandler.peerConnection;
    if (!pc) {
      toast.warning("No se pudo acceder al audio de la llamada.");
      return;
    }

    const audioSenders = pc
      .getSenders()
      .filter((sender: RTCRtpSender) => sender.track && sender.track.kind === "audio");

    if (audioSenders.length === 0) {
      toast.warning("No se encontró el micrófono en la llamada activa.");
      return;
    }

    micSilenciado.value = !micSilenciado.value;

    audioSenders.forEach((sender: RTCRtpSender) => {
      sender.track!.enabled = !micSilenciado.value;
    });
  }

  const resetMic = () => {
    micSilenciado.value = false;
  };

  const manejarLlamadaEntrante = async (invitation: any) => {
    currentSession.value = invitation;
    resetMic();

    invitation.stateChange.addListener((state: any) => {
      if (state === SIP.SessionState.Terminated) {
        currentSession.value = null;
        resetMic();
      }
    });

    try {
      await invitation.accept({
        sessionDescriptionHandlerOptions: {
          constraints: {
            audio: true,
            video: false,
          },
        },
      });

      configurarAudioRemoto(invitation);

    } catch (error) {
      console.error("❌ invitation.accept() FALLÓ:", error);
    }
  };

  const registrarUserAgent = async (credentials: ISipCredentials) => {
    if (userAgent.value) {
      return;
    }

    userAgent.value = new SIP.UserAgent({
      uri: SIP.UserAgent.makeURI(`sip:${credentials.agentExtension}@${credentials.sipServer}`),
      transportOptions: {
        server: `wss://${credentials.sipServer}:${credentials.sipPort}/ws`,
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

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timeout esperando confirmación de registro SIP"));
      }, 10000);

      registerer.value.stateChange.addListener((state: SIP.RegistererState) => {
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

    toast.success(`Agente ${credentials.agentExtension} conectado`);
  };

  const conectarTelefono = async (): Promise<ISipCredentials> => {
    cargandoTelefono.value = true;

    try {
      const credenciales = await obtenerCredencialesSip();

      sipCredentials.value = {
        agentExtension: credenciales.sipUsername,
        sipServer: credenciales.sipServer,
        sipPort: credenciales.sipPort,
        agentPassword: credenciales.sipPassword,
      };

      await registrarUserAgent(sipCredentials.value);

      sipRegistrado.value = true;

      return sipCredentials.value;
    } catch (error) {
      console.error("❌ Error conectando teléfono:", error);

      userAgent.value = null;
      registerer.value = null;
      currentSession.value = null;
      sipRegistrado.value = false;

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
    micSilenciado,
    toggleMic,
  };
}