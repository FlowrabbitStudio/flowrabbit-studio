package ai.flowrabbit.services;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;

import javax.crypto.Cipher;



public class BlowFishService implements EncryptionService {
    private static final String ALGORITHM = "Blowfish";

    private final SecretKeySpec secretKeySpec;
    public BlowFishService(String secretKey) throws NoSuchAlgorithmException, InvalidKeySpecException {
        byte[] keyData = secretKey.getBytes();
        secretKeySpec = new SecretKeySpec(keyData, ALGORITHM);
    }

    public String encrypt(String secretMessage) throws Exception {
        Cipher encryptCipher = Cipher.getInstance(ALGORITHM);
        encryptCipher.init(Cipher.ENCRYPT_MODE, secretKeySpec);
        byte[] encryptedBytes = encryptCipher.doFinal(secretMessage.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(encryptedBytes);
    }

    public String decrypt(String encryptedtext) throws Exception {
        byte[] encryptedTextToBytes = Base64.getDecoder().decode(encryptedtext);
        Cipher decryptCipher = Cipher.getInstance(ALGORITHM);
        decryptCipher.init(Cipher.DECRYPT_MODE, secretKeySpec);
        byte[] decrypted = decryptCipher.doFinal(encryptedTextToBytes);
        return new String(decrypted, StandardCharsets.UTF_8);
    }


}
