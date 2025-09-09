//package ai.flowrabbit.services;
//
//import javax.crypto.Cipher;
//import javax.crypto.SecretKeyFactory;
//import javax.crypto.SecretKey;
//import javax.crypto.spec.IvParameterSpec;
//import javax.crypto.spec.PBEKeySpec;
//import javax.crypto.spec.SecretKeySpec;
//import java.security.SecureRandom;
//import java.util.Base64;
//
//public class AESService implements EncryptionService {
//    private static final String ALGORITHM = "AES/CBC/PKCS5Padding";
//    private static final int KEY_SIZE = 256;
//    private static final int ITERATIONS = 65536;
//    private static final int SALT_LENGTH = 16;
//
//    private final String password;
//
//    public AESService(String password) {
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
//        // Generate IV
//        byte[] iv = new byte[16];
//        new SecureRandom().nextBytes(iv);
//        IvParameterSpec ivParams = new IvParameterSpec(iv);
//
//        // Encrypt
//        Cipher cipher = Cipher.getInstance(ALGORITHM);
//        cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivParams);
//        byte[] cipherText = cipher.doFinal(plainText.getBytes());
//
//        // Concatenate salt + iv + ciphertext
//        byte[] combined = new byte[salt.length + iv.length + cipherText.length];
//        System.arraycopy(salt, 0, combined, 0, salt.length);
//        System.arraycopy(iv, 0, combined, salt.length, iv.length);
//        System.arraycopy(cipherText, 0, combined, salt.length + iv.length, cipherText.length);
//
//        return Base64.getEncoder().encodeToString(combined);
//    }
//
//    public String decrypt(String encryptedText) throws Exception {
//        byte[] decoded = Base64.getDecoder().decode(encryptedText);
//
//        // Extract salt, iv, ciphertext
//        byte[] salt = new byte[SALT_LENGTH];
//        byte[] iv = new byte[16];
//        byte[] cipherText = new byte[decoded.length - SALT_LENGTH - iv.length];
//
//        System.arraycopy(decoded, 0, salt, 0, SALT_LENGTH);
//        System.arraycopy(decoded, SALT_LENGTH, iv, 0, iv.length);
//        System.arraycopy(decoded, SALT_LENGTH + iv.length, cipherText, 0, cipherText.length);
//
//        SecretKeySpec secretKey = createSecretKey(password.toCharArray(), salt);
//        IvParameterSpec ivParams = new IvParameterSpec(iv);
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
//        return new SecretKeySpec(secretKey.getEncoded(), "AES");
//    }
//}