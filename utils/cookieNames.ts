/** Cookie set only after the user accepts the consent banner. */
export const COOKIE_CONSENT_NAME = 'alpha_cookie_consent'

/** Preference / tracking cookies — cleared on client when consent is missing. */
export const COOKIES_BLOCKED_UNTIL_CONSENT = [
  'i18n_redirected',
  'alpha_city_id',
  'alpha_auth_session',
  'alpha_auth_token',
  'alpha_selected_subscription_id',
  'alpha_has_active_subscription',
  'sub_active',
] as const
