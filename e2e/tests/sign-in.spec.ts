import { expect, test } from '@playwright/test';

test('has expected information', async ({ page }) => {
  await page.goto('/sign-in');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/sbrubbles-forge/);
});

// test that the sign-in page has a form with email and password fields
test('has sign-in form', async ({ page }) => {
  await page.goto('/sign-in');

  // check that the form has an email and password field
  const emailField = page.locator('input[name="email"]');
  const passwordField = page.locator('input[name="password"]');
  const signInBtn = page.getByTestId('sign-in-btn');

  await expect(emailField).toBeVisible();
  await expect(passwordField).toBeVisible();
  await expect(signInBtn).toBeVisible();
  await page.screenshot({ path: 'screenshots/sign-in-form.png' });
});

// test that error messages are shwown when the form is submitted with empty fields
test('shows error messages on empty form submission', async ({ page }) => {
  await page.goto('/sign-in');

  const signInBtn = page.getByTestId('sign-in-btn');
  await signInBtn.click();

  // check that the error messages are shown
  const emailError = page.locator('text=Email is required');
  const passwordError = page.locator('text=Password is required');

  await expect(emailError).toBeVisible();
  await expect(passwordError).toBeVisible();
});

// test that the form can be submitted with valid credentials
test('can sign in with valid credentials', async ({ page }) => {
  await page.goto('/sign-in');

  // check that the error messages are shown
  const emailField = page.locator('input[name="email"]');
  const passwordField = page.locator('input[name="password"]');

  emailField.fill('test@test.com');
  passwordField.fill('password-test-123');

  const signInBtn = page.getByTestId('sign-in-btn');
  await signInBtn.click();
});
