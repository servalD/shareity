import axios from 'axios';

export class PinataService {
  private static readonly PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || '';
  private static readonly PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || '';

  static async uploadImage(file: File): Promise<string> {
    try {
      // Créer un FormData avec le fichier
      const formData = new FormData();
      formData.append('file', file);

      // Headers pour l'authentification Pinata
      const headers = {
        'pinata_api_key': this.PINATA_API_KEY,
        'pinata_secret_api_key': this.PINATA_SECRET_KEY,
      };

      // Upload vers Pinata
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        { headers }
      );

      if (response.status === 200) {
        // Retourner l'URL IPFS
        const ipfsHash = response.data.IpfsHash;
        return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      } else {
        throw new Error('Failed to upload to Pinata');
      }
    } catch (error) {
      console.error('Error uploading to Pinata:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  }

  static async uploadMetadata(metadata: any): Promise<string> {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'pinata_api_key': this.PINATA_API_KEY,
        'pinata_secret_api_key': this.PINATA_SECRET_KEY,
      };

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        metadata,
        { headers }
      );

      if (response.status === 200) {
        const ipfsHash = response.data.IpfsHash;
        return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      } else {
        throw new Error('Failed to upload metadata to Pinata');
      }
    } catch (error) {
      console.error('Error uploading metadata to Pinata:', error);
      throw new Error('Failed to upload metadata. Please try again.');
    }
  }
} 