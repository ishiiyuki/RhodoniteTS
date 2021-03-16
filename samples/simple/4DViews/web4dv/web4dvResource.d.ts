export = ResourceManagerXHR;
declare class ResourceManagerXHR {
  _internalCacheSize: number;
  _sequenceInfo: {
    NbFrames: number;
    NbBlocs: number;
    FrameRate: number;
    MaxVertices: number;
    MaxTriangles: number;
    TextureEncoding: number;
    TextureSizeX: number;
    TextureSizeY: number;
    NbAdditionalTracks: number;
  };
  _pointerToSequenceInfo: number;
  _pointerToBlocIndex: number;
  _pointerToTrackIndex: number;
  _blocInfos: unknown[];
  _KFPositions: unknown[];
  _currentBlocIndex: number;
  _firstBlocIndex: number;
  _lastBlocIndex: number;
  _tracksPositions: unknown[];
  _audioTrack: unknown[];
  _isInitialized: boolean;
  _isDownloading: boolean;
  _file4ds: string;
  _callback: unknown;
  Open(callbackFunction?: Function): void;
  fetchBuffer(firstByte: number, lastByte: number): Promise<Response>;
  getOneChunk(position: number): void;
  getBunchOfChunks(onLoadCallback?: Function): void;
  reinitResources(): void;
  seek(frame: number): void;
  getChunkData(position: number, size: number): void;
  getFileHeader(): void;
  getSequenceInfo(position: number, size: number): void;
  getBlocsInfos(position: number, size: number): void;
  getTracksIndexes(position: number, size: number): void;
  getAudioTrack(position: number, size: number): void;
  set4DSFile(file: string): void;
}
declare namespace ResourceManagerXHR {
  export {Decoder4D};
}
declare const Decoder4D: Decoder;
declare class Decoder {
  _codecInstance: unknown;
  _decodedFrames: unknown[];
  _chunks4D: {
    delete: () => void;
  }[];
  _curChunkIndex: number;
  _keepChunksInCache: boolean;
  _maxCacheSize: number;
  Destroy(): void;
  SetInputTextureEncoding(encoding: number): void;
  DecodeChunk(): {
    frame: number;
    GetVertices: () => Float32Array;
    GetFaces: () => Uint32Array;
    GetUVs: () => Float32Array;
    GetNormals: () => Float32Array;
    GetTexture: () => Uint8Array;
    delete: () => void;
  };
}

export {};
//# sourceMappingURL=web4dvResource.d.ts.map
