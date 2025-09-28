import {
  useVoiceAssistant,
  BarVisualizer,
  VoiceAssistantControlBar,
  useTrackTranscription,
  useLocalParticipant,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useEffect, useState } from "react";
import { useTracks, VideoTrack } from '@livekit/components-react';
import "./AvatarVoiceAgent.css";

interface MessageProps {
  type: "agent" | "user";
  text: string;
}

interface TranscriptionMessage {
  type: "agent" | "user";
  text: string;
  firstReceivedTime: number;
}

const Message: React.FC<MessageProps> = ({ type, text }) => {
  return <div className="message">
    <strong className={`message-${type}`}>
      {type === "agent" ? "Agent: " : "You: "}
    </strong>
    <span className="message-text">{text}</span>
  </div>;
};

const AvatarVoiceAgent: React.FC = () => {
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const localParticipant = useLocalParticipant();
  const { segments: userTranscriptions } = useTrackTranscription({
    publication: localParticipant.microphoneTrack,
    source: Track.Source.Microphone,
    participant: localParticipant.localParticipant,
  });
  const trackRefs = useTracks([Track.Source.Camera]);
  // Look for avatar video track (not from admin user)
  const avatarVideoTrackRef = trackRefs.find((trackRef) => 
    trackRef.participant.name !== 'admin' && trackRef.participant.name !== localParticipant.localParticipant.name
  );

  const [messages, setMessages] = useState<TranscriptionMessage[]>([]);

  useEffect(() => {
    const allMessages: TranscriptionMessage[] = [
      ...(agentTranscriptions?.map((t) => ({ ...t, type: "agent" as const })) ?? []),
      ...(userTranscriptions?.map((t) => ({ ...t, type: "user" as const })) ?? []),
    ].sort((a, b) => a.firstReceivedTime - b.firstReceivedTime);
    setMessages(allMessages);
  }, [agentTranscriptions, userTranscriptions]);

  return (
    <div className="voice-assistant-container">
      <div className="visualizer-container">
        <BarVisualizer state={state} barCount={5} trackRef={audioTrack} />
      </div>
      <div className="avatar-video-container">
        {avatarVideoTrackRef ? (
          <VideoTrack 
            trackRef={avatarVideoTrackRef} 
            className="avatar-video"
          />
        ) : (
          <div className="avatar-loading">
            <div className="avatar-placeholder">
              <div className="avatar-spinner"></div>
              <p>Connecting to AI Avatar...</p>
            </div>
          </div>
        )}
      </div>
      <div className="control-section">
        <VoiceAssistantControlBar />
      </div>
    </div>
  );
};

export default AvatarVoiceAgent;
