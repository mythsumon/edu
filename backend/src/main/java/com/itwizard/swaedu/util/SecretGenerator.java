package com.itwizard.swaedu.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.KeyGenerator;
import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class SecretGenerator {

  private final SecretKey secretKey;

  public SecretGenerator(@Value("${crypto.key}") String secret) throws Exception {
    MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
    byte[] keyBytes = sha256.digest(secret.getBytes(StandardCharsets.UTF_8));
    this.secretKey = new SecretKeySpec(keyBytes, "AES");
  }

  public static String toBase64url(byte[] secret) {
    // URL-safe, no padding (perfect for tokens, random secret)
    return Base64.getUrlEncoder()
        .withoutPadding()
        .encodeToString(secret);
  }

  public byte[] generate(int bytes) {
    byte[] randomBytes = new byte[bytes];
    SecureRandom secureRandom = new SecureRandom();
    secureRandom.nextBytes(randomBytes);

    return randomBytes;
  }

  public String generateString(int bytes) {
    byte[] randomBytes = this.generate(bytes);
    return SecretGenerator.toBase64url(randomBytes);
  }

  public SecretKey generateSecretKey(int keySize) throws Exception {
    KeyGenerator keyGen = KeyGenerator.getInstance("AES");
    keyGen.init(keySize, new SecureRandom());
    return keyGen.generateKey();
  }

  public String hmac(String token) throws Exception {
    Mac mac = Mac.getInstance("HmacSHA256");
    SecretKeySpec keySpec = new SecretKeySpec(this.secretKey.getEncoded(), "HmacSHA256");
    mac.init(keySpec);
    byte[] hash = mac.doFinal(token.getBytes(StandardCharsets.UTF_8));
    return Base64.getEncoder().encodeToString(hash);
  }
}
