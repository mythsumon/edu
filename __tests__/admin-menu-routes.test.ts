import { test, expect } from '@playwright/test';

test.describe('Admin Menu Routes', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');
  });

  test('should have all main menu items', async ({ page }) => {
    // Check dashboard menu
    await expect(page.getByText('대시보드')).toBeVisible();
    await expect(page.getByText('전체 프로그램 현황')).toBeVisible();

    // Check education operations menu
    await expect(page.getByText('교육 운영')).toBeVisible();
    await expect(page.getByText('교육 관리')).toBeVisible();

    // Check instructor assignment menu
    await expect(page.getByText('강사 배정')).toBeVisible();
    await expect(page.getByText('강사 신청 관리')).toBeVisible();
    await expect(page.getByText('강사 배정 관리')).toBeVisible();
    await expect(page.getByText('출강 확정 관리')).toBeVisible();

    // Check reference information menu
    await expect(page.getByText('기준정보 관리')).toBeVisible();
    await expect(page.getByText('교육기관 관리')).toBeVisible();
    await expect(page.getByText('프로그램 관리')).toBeVisible();
    await expect(page.getByText('강사 관리')).toBeVisible();

    // Check system management menu
    await expect(page.getByText('시스템 관리')).toBeVisible();
    await expect(page.getByText('설정 및 사용자 관리')).toBeVisible();
  });

  test('should navigate to education management page', async ({ page }) => {
    await page.click('text=교육 운영');
    await page.click('text=교육 관리');
    await expect(page).toHaveURL(/.*\/education/);
  });

  test('should navigate to instructor application page', async ({ page }) => {
    await page.click('text=강사 배정');
    await page.click('text=강사 신청 관리');
    await expect(page).toHaveURL(/.*\/instructor\/application/);
  });

  test('should navigate to instructor assignment page', async ({ page }) => {
    await page.click('text=강사 배정');
    await page.click('text=강사 배정 관리');
    await expect(page).toHaveURL(/.*\/instructor\/assignment/);
  });

  test('should navigate to instructor confirmation page', async ({ page }) => {
    await page.click('text=강사 배정');
    await page.click('text=출강 확정 관리');
    await expect(page).toHaveURL(/.*\/instructor\/confirmation/);
  });

  test('should navigate to institution management page', async ({ page }) => {
    await page.click('text=기준정보 관리');
    await page.click('text=교육기관 관리');
    await expect(page).toHaveURL(/.*\/institution/);
  });

  test('should navigate to program management page', async ({ page }) => {
    await page.click('text=기준정보 관리');
    await page.click('text=프로그램 관리');
    await expect(page).toHaveURL(/.*\/program/);
  });

  test('should navigate to instructor management page', async ({ page }) => {
    await page.click('text=기준정보 관리');
    await page.click('text=강사 관리');
    await expect(page).toHaveURL(/.*\/instructor/);
  });

  test('should navigate to system settings page', async ({ page }) => {
    await page.click('text=시스템 관리');
    await page.click('text=설정 및 사용자 관리');
    await expect(page).toHaveURL(/.*\/system\/settings/);
  });
});