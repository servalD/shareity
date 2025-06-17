import axios from 'axios';

export class PinataService {
  private static readonly PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || '';
  private static readonly PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || '';

  static async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const headers = {
        'pinata_api_key': this.PINATA_API_KEY,
        'pinata_secret_api_key': this.PINATA_SECRET_KEY,
      };

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        { headers }
      );

      if (response.status === 200) {
        const ipfsHash = response.data.IpfsHash;
        return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      } else {
        throw new Error('Failed to upload to Pinata');
      }
    } catch (error) {
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
      throw new Error('Failed to upload metadata. Please try again.');
    }
  }
} 