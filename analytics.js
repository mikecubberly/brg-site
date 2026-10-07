(() => {
  'use strict';
  const id = 'G-HX7Q6BSFPQ';
  const key = 'brg.ga.consent.v1';
  let started = false, choice = '';
  try { choice = localStorage.getItem(key) || ''; } catch {}
  const clean = value => { try { const u = new URL(value); return u.origin + u.pathname; } catch { return ''; } };
  function start() {
    if (started || choice !== 'granted') return;
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('consent', 'default', {analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    gtag('js', new Date());
    const config = {page_location:clean(location.href),page_referrer:clean(document.referrer),allow_google_signals:false,allow_ad_personalization_signals:false};
    const params = new URLSearchParams(location.search);
    for (const [utm,field] of [['utm_source','campaign_source'],['utm_medium','campaign_medium'],['utm_campaign','campaign_name']]) {
      const value = params.get(utm);
      if (value && /^[a-zA-Z0-9_.-]{1,80}$/.test(value)) config[field] = value;
    }
    gtag('config', id, config);
    const tag = document.createElement('script');
    tag.async = true; tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(tag);
  }
  window.brgTrackLead = () => {
    if (choice === 'granted' && started) gtag('event','generate_lead',{send_to:id,form_id:'brg_contact',page_location:clean(location.href)});
  };
  function render() {
    const style = document.createElement('style');
    style.textContent = '#brg-ga-banner{position:fixed;z-index:10000;bottom:18px;left:18px;right:18px;max-width:620px;padding:20px;background:#10283b;color:#fff;border:1px solid #517081;border-radius:12px;box-shadow:0 8px 35px #0005;font:15px/1.5 system-ui,sans-serif}#brg-ga-banner[hidden]{display:none}#brg-ga-banner p{margin:0 0 12px}#brg-ga-banner a{color:#b8e0ff}#brg-ga-banner button,#brg-ga-settings{font:inherit;cursor:pointer;border:1px solid #7d98aa;border-radius:6px;padding:8px 12px}#brg-ga-banner button{margin:0 8px 0 0;background:#fff;color:#10283b}#brg-ga-settings{position:fixed;bottom:6px;right:8px;z-index:9999;background:#10283b;color:#fff;font:12px system-ui,sans-serif;padding:5px 8px}';
    document.head.appendChild(style);
    const banner = document.createElement('section');
    banner.id = 'brg-ga-banner'; banner.setAttribute('aria-label','Google Analytics choice'); banner.hidden = !!choice;
    banner.innerHTML = '<p><strong>Optional Google Analytics</strong><br>Allow Google Analytics cookies to help us understand page visits and completed inquiries. Your choice here controls Google Analytics. <a href="/privacy/">Privacy notice</a>.</p><button type="button" data-choice="denied">Decline</button><button type="button" data-choice="granted">Allow analytics</button>';
    banner.addEventListener('click', event => {
      const value = event.target.dataset.choice; if (!value) return;
      const previous = choice; choice = value;
      try { localStorage.setItem(key,choice); } catch {}
      banner.hidden = true;
      if (choice === 'denied' && started) {
        gtag('consent','update',{analytics_storage:'denied'});
        for (const cookie of document.cookie.split(';')) {
          const name = cookie.split('=')[0].trim();
          if (name === '_ga' || name.startsWith('_ga_')) for (const domain of ['',location.hostname,'.'+location.hostname]) document.cookie = name+'=; Max-Age=0; path=/'+(domain?'; domain='+domain:'');
        }
        if (previous === 'granted') location.reload();
      } else start();
    });
    const settings = document.createElement('button'); settings.id = 'brg-ga-settings'; settings.type = 'button'; settings.textContent = 'Analytics settings';
    settings.addEventListener('click', () => { banner.hidden = false; banner.querySelector('button').focus(); });
    document.body.append(banner,settings);
  }
  start();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',render,{once:true}); else render();
})();
