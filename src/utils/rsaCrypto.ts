import * as jsrsasign from 'jsrsasign';

const {KEYUTIL} = jsrsasign;

export class RSACrypto {
    private publicKey: string | null = null;

    // Encrypt with provided public key (for testing)
    static async encryptWithKey(plaintext: string, publicKeyPEM: string): Promise<string> {
        const rsa = new RSACrypto();
        rsa.setPublicKey(publicKeyPEM);
        return await rsa.encrypt(plaintext);
    }

    // Validate if a key is valid RSA public key
    static validatePublicKey(keyPEM: string): boolean {
        try {
            const keyObj = KEYUTIL.getKey(keyPEM);
            // Check if it's an RSA key and has only public key components (n, e)
            // A public key has modulus (n) and exponent (e) but no private components
            return keyObj && 
                   'n' in keyObj && 
                   'e' in keyObj && 
                   !('d' in keyObj); // 'd' is the private exponent, shouldn't exist in public key
        } catch {
            return false;
        }
    }

    // Set the public key received from backend
    setPublicKey(publicKeyPEM: string) {
        this.publicKey = publicKeyPEM;
    }

    // Get the current public key
    getPublicKey(): string | null {
        return this.publicKey;
    }

    // Encrypt data using RSA-OAEP (compatible with backend)
    async encrypt(plaintext: string): Promise<string> {
        if (!this.publicKey) {
            throw new Error('Public key not set. Call setPublicKey() first.');
        }

        if (!plaintext || typeof plaintext !== 'string') {
            throw new Error('Invalid plaintext for encryption');
        }

        try {
            // Use Web Crypto API for RSA-OAEP encryption
            // First, import the public key
            const publicKeyBuffer = this.pemToArrayBuffer(this.publicKey);

            const cryptoKey = await window.crypto.subtle.importKey(
                'spki',
                publicKeyBuffer,
                {
                    name: 'RSA-OAEP',
                    hash: 'SHA-256',
                },
                false,
                ['encrypt']
            );

            // Encrypt the plaintext
            const plaintextBuffer = new TextEncoder().encode(plaintext);
            const encryptedBuffer = await window.crypto.subtle.encrypt(
                {
                    name: 'RSA-OAEP',
                },
                cryptoKey,
                plaintextBuffer
            );

            // Convert to base64 to match backend format
            return this.arrayBufferToBase64(encryptedBuffer);
        } catch (error) {
            throw new Error(`RSA encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Helper method to convert string to hex
    private stringToHex(str: string): string {
        let hex = '';
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i);
            hex += charCode.toString(16).padStart(2, '0');
        }
        return hex;
    }

    // Helper method to convert hex to base64
    private hexToBase64(hex: string): string {
        // Convert hex string to binary
        const binary = hex.match(/.{1,2}/g)?.map(byte => String.fromCharCode(parseInt(byte, 16))).join('') || '';
        // Convert binary to base64
        return btoa(binary);
    }

    // Helper method to convert PEM to ArrayBuffer
    private pemToArrayBuffer(pem: string): ArrayBuffer {
        // Remove the header and footer
        const pemHeader = '-----BEGIN PUBLIC KEY-----';
        const pemFooter = '-----END PUBLIC KEY-----';
        const pemContents = pem.replace(pemHeader, '').replace(pemFooter, '').replace(/\s/g, '');

        // Decode base64 to binary string
        const binaryString = atob(pemContents);

        // Convert binary string to ArrayBuffer
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        return bytes.buffer;
    }

    // Helper method to convert ArrayBuffer to base64
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
}

// Export singleton instance
export const rsaCrypto = new RSACrypto();

// Export utility functions
export const encryptWithKey = RSACrypto.encryptWithKey;
export const validatePublicKey = RSACrypto.validatePublicKey; 