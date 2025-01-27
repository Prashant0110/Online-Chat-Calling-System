import { useEffect, useRef } from "react";
import Peer from "peerjs";

export const usePeer = (userId) => {
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    const peer = new Peer(userId);
    peerRef.current = peer;

    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    getMedia();

    return () => {
      peer.destroy();
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [userId]);

  const startCall = async (remotePeerId) => {
    try {
      const call = peerRef.current.call(remotePeerId, localStreamRef.current);
      return call;
    } catch (error) {
      console.error("Error starting call:", error);
      throw error;
    }
  };

  return {
    peer: peerRef.current,
    startCall,
    localStream: localStreamRef.current,
  };
};
