package ai.flowrabbit;

import ai.flowrabbit.services.BlowFishService;
import ai.flowrabbit.services.ChaChaService;
import ai.flowrabbit.services.EncryptionService;
import org.junit.Assert;
import org.junit.Test;

public class EncryptionServiceTest {

    @Test
    public void testBlowFish() throws Exception {
        System.out.println("EncryptionServiceTest.testBlowFish() > enter");
        BlowFishService s = new BlowFishService("hoosefw45345dfsdfasdasdasdasd");
        BlowFishService s2 = new BlowFishService("hoosefw45345dfsdfasdasdasdasd");
        BlowFishService s3 = new BlowFishService("wrongPassword");
        assertService(s,s2, s3);
    }

    @Test
    public void testChaCha() throws Exception {
        System.out.println("EncryptionServiceTest.testChaCha() > enter");
        ChaChaService s = new ChaChaService("hoosefw45345dfsdfasdasdasdasd");
        ChaChaService s2 = new ChaChaService("hoosefw45345dfsdfasdasdasdasd");
        ChaChaService s3 = new ChaChaService("sefgdsfg");
        assertService(s, s2, s3);
    }
//
//    @Test
//    public void testAES() throws Exception {
//        System.out.println("EncryptionServiceTest.testAES() > enter");
//        AESService s = new AESService("hoosefw45345dfsdfasdasdasdasd");
//        AESService s2 = new AESService("hoosefw45345dfsdfasdasdasdasd");
//        AESService s3 = new AESService("asdasd");
//        assertService(s, s2, s3);
//    }

    private static void assertService(EncryptionService s, EncryptionService s2, EncryptionService s3) throws Exception {

        // empty string should stay empty
        Assert.assertEquals("", s.encrypt(""));
        Assert.assertEquals("", s.decrypt(""));

        String encrypted = s.encrypt("abc");
        Assert.assertNotEquals("abc", encrypted);

        String decrypted = s.decrypt(encrypted);
        Assert.assertEquals("abc", decrypted);

        String decrypted2 = s2.decrypt(encrypted);
        Assert.assertEquals("abc", decrypted2);

        boolean exceptionThrows = false;
        try {
            String decrypted3 = s3.decrypt(encrypted);
        } catch (Exception err) {
            exceptionThrows = true;
        }
        Assert.assertTrue(exceptionThrows);
    }


}
