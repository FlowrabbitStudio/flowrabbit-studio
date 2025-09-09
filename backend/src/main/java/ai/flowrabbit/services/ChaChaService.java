//package ai.flowrabbit.services;
//
//import javax.crypto.Cipher;
//import javax.crypto.SecretKey;
//import javax.crypto.SecretKeyFactory;
//import javax.crypto.spec.PBEKeySpec;
//import javax.crypto.spec.SecretKeySpec;
//import javax.crypto.spec.ChaCha20ParameterSpec;
//import javax.crypto.spec.IvParameterSpec;
//import java.security.SecureRandom;
//import java.util.Base64;
//
//public class ChaChaService implements EncryptionService {
//    private static final String ALGORITHM = "ChaCha20-Poly1305";
//    private static final int KEY_SIZE = 256;
//    private static final int ITERATIONS = 65536;
//    private static final int SALT_LENGTH = 16;
//    private static final int NONCE_LENGTH = 12; // required for ChaCha20-Poly1305
//
//    private final String password;
//
//    public ChaChaService(String password) {
//        this.password = password;
//    }
//
//    public String encrypt(String plainText) throws Exception {
//        // Generate salt
//        byte[] salt = new byte[SALT_LENGTH];
//        new SecureRandom().nextBytes(salt);
//
//        // Derive key
//        SecretKeySpec secretKey = createSecretKey(password.toCharArray(), salt);
//
//        // Generate nonce
//        byte[] nonce = new byte[NONCE_LENGTH];
//        new SecureRandom().nextBytes(nonce);
//        IvParameterSpec ivParams = new IvParameterSpec(nonce);
//
//        // Encrypt
//        Cipher cipher = Cipher.getInstance(ALGORITHM);
//        cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivParams);
//        byte[] cipherText = cipher.doFinal(plainText.getBytes());
//
//        // Concatenate salt + nonce + ciphertext
//        byte[] combined = new byte[salt.length + nonce.length + cipherText.length];
//        System.arraycopy(salt, 0, combined, 0, salt.length);
//        System.arraycopy(nonce, 0, combined, salt.length, nonce.length);
//        System.arraycopy(cipherText, 0, combined, salt.length + nonce.length, cipherText.length);
//
//        return Base64.getEncoder().encodeToString(combined);
//    }
//
//    public String decrypt(String encryptedText) throws Exception {
//        byte[] decoded = Base64.getDecoder().decode(encryptedText);
//
//        // Extract salt, nonce, ciphertext
//        byte[] salt = new byte[SALT_LENGTH];
//        byte[] nonce = new byte[NONCE_LENGTH];
//        byte[] cipherText = new byte[decoded.length - SALT_LENGTH - NONCE_LENGTH];
//
//        System.arraycopy(decoded, 0, salt, 0, SALT_LENGTH);
//        System.arraycopy(decoded, SALT_LENGTH, nonce, 0, NONCE_LENGTH);
//        System.arraycopy(decoded, SALT_LENGTH + NONCE_LENGTH, cipherText, 0, cipherText.length);
//
//        SecretKeySpec secretKey = createSecretKey(password.toCharArray(), salt);
//        IvParameterSpec ivParams = new IvParameterSpec(nonce);
//
//        Cipher cipher = Cipher.getInstance(ALGORITHM);
//        cipher.init(Cipher.DECRYPT_MODE, secretKey, ivParams);
//
//        byte[] plainTextBytes = cipher.doFinal(cipherText);
//        return new String(plainTextBytes);
//    }
//
//    private SecretKeySpec createSecretKey(char[] password, byte[] salt) throws Exception {
//        PBEKeySpec spec = new PBEKeySpec(password, salt, ITERATIONS, KEY_SIZE);
//        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
//        SecretKey secretKey = factory.generateSecret(spec);
//        return new SecretKeySpec(secretKey.getEncoded(), "ChaCha20");
//    }
//}