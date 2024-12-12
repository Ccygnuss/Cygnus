import { useState, useEffect } from "react"

export default function PhantomWallet() {
    const [provider, setProvider] = useState(null)
    const [publicKey, setPublicKey] = useState<string | null>(null)
    const [status, setStatus] = useState("Not connected.")

    // Detect Phantom Provider
    const getProvider = () => {
        if ("phantom" in window) {
            const provider = (window as any).phantom?.solana
            if (provider?.isPhantom) {
                return provider
            }
        }
        window.open("https://phantom.app/", "_blank")
    }

    // Connect to Phantom Wallet
    const connectToPhantom = async () => {
        const phantomProvider = getProvider()
        setProvider(phantomProvider)

        if (!phantomProvider) {
            setStatus("Phantom Wallet is not installed.")
            return
        }

        try {
            const response = await phantomProvider.connect()
            setPublicKey(response.publicKey.toString())
            setStatus("Connected successfully!")
        } catch (error: any) {
            setStatus(`Connection failed: ${error.message}`)
        }
    }

    // Disconnect from Phantom Wallet
    const disconnectFromPhantom = () => {
        if (provider) {
            provider.disconnect()
            setPublicKey(null)
            setStatus("Disconnected from Phantom Wallet.")
        }
    }

    // Handle events: connect, disconnect, and accountChanged
    useEffect(() => {
        const phantomProvider = getProvider()
        if (phantomProvider) {
            setProvider(phantomProvider)

            // Eagerly connect if trusted
            phantomProvider
                .connect({ onlyIfTrusted: true })
                .then(({ publicKey }: any) => {
                    setPublicKey(publicKey.toString())
                    setStatus("Eagerly connected to a trusted session.")
                })
                .catch(() => {
                    setStatus("Not connected.")
                })

            // Handle connect event
            phantomProvider.on("connect", (publicKey: any) => {
                setPublicKey(publicKey.toString())
                setStatus("Wallet connected!")
            })

            // Handle disconnect event
            phantomProvider.on("disconnect", () => {
                setPublicKey(null)
                setStatus("Wallet disconnected.")
            })

            // Handle accountChanged event
            phantomProvider.on("accountChanged", (newPublicKey: any) => {
                if (newPublicKey) {
                    setPublicKey(newPublicKey.toBase58())
                    setStatus(`Switched to account ${newPublicKey.toBase58()}`)
                } else {
                    // Attempt to reconnect if no public key is provided
                    phantomProvider.connect().catch((error: any) => {
                        setStatus(`Reconnection failed: ${error.message}`)
                    })
                }
            })
        }

        // Cleanup event listeners when component unmounts
        return () => {
            if (phantomProvider) {
                phantomProvider.removeAllListeners("connect")
                phantomProvider.removeAllListeners("disconnect")
                phantomProvider.removeAllListeners("accountChanged")
            }
        }
    }, [])
}

// Styles
const containerStyle = {
    textAlign: "center",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
}

const buttonStyle = {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
}
