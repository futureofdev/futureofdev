import assert from "node:assert/strict";
import test from "node:test";
import {
  COURSE_DOWNLOAD_TTL_SECONDS,
  createCourseDownloadToken,
  verifyCourseDownloadToken,
} from "./course-token";

const secret = "test-only-secret-that-is-long-enough-for-hmac";
const now = Date.UTC(2026, 7, 17, 12, 0, 0);

test("course token accepts a valid unexpired signature", async () => {
  const token = await createCourseDownloadToken(secret, now);
  assert.equal(await verifyCourseDownloadToken(token, secret, now), true);
});

test("course token rejects expiry, tampering and the wrong secret", async () => {
  const token = await createCourseDownloadToken(secret, now);
  const expiredAt = now + (COURSE_DOWNLOAD_TTL_SECONDS + 1) * 1_000;
  assert.equal(await verifyCourseDownloadToken(token, secret, expiredAt), false);
  assert.equal(await verifyCourseDownloadToken(`${token}x`, secret, now), false);
  assert.equal(await verifyCourseDownloadToken(token, "different-secret", now), false);
});
