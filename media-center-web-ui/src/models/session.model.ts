export type Session = {
    arguments: {
        torrents: 
            {
                error: "Ok" | "TrackerWarning" | "TrackerError" | "LocalError";
                errorString: string;
                eta: string;
                id: string;
                isFinished: string;
                leftUntilDone: string;
                name: string;
                peersGettingFromUs: string;
                peersSendingToUs: string;
                rateDownload: string;
                rateUpload: string;
                sizeWhenDone: string;
                status: "Seeding" | "Stopped" | "QueuedToVerify" | "Verifying" | "QueuedToDownload" | "Downloading" | "QueuedToSeed";
                uploadRatio: string
                torrentFile: string;
                hashString: string;
            }[];
    };
    result: string;
}
