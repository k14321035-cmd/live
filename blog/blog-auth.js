/**
 * Code Tutorium - Blog Authentication Guard
 * Redirects unauthorized users to the login page.
 */
(function () {
  // Inject Supabase CDN script dynamically
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.onload = async () => {
    try {
      const client = supabase.createClient("https://chwxjjeqgubqavwxoyzl.supabase.co", "sb_publishable_NhS83dmkyY3WxVNQLiJD2w_CXtuhWwL");
      const { data: { session }, error } = await client.auth.getSession();
      if (error || !session || !session.user) {
        window.location.href = '../login.html?auth_trigger=login';
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      window.location.href = '../login.html?auth_trigger=login';
    }
  };
  script.onerror = () => {
    window.location.href = '../login.html?auth_trigger=login';
  };
  document.head.appendChild(script);
})();
