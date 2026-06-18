"use client";

import { createContext, useContext, useState, useEffect } from "react";

export const LANGS = ["de", "en", "tr"];
export const LANG_LABELS = { de: "DE", en: "EN", tr: "TR" };

export const t = {
  de: {
    login: "Anmelden", register: "Registrieren", logout: "Abmelden", dashboard: "Meine Websites",
    hero_title: "Professionelle Website\nfür Ihren Friseursalon",
    hero_sub: "Fotos und Infos einsenden – in wenigen Minuten geht Ihre mobilfreundliche Friseursalon-Website online.",
    hero_cta: "Jetzt starten", hero_cta2: "Anmelden",
    features_title: "Alles was Ihr Salon braucht",
    feat1_title: "Online-Termin 24/7", feat1_desc: "Kunden buchen jederzeit einen Termin – ohne Telefonanruf.",
    feat2_title: "5 moderne Designs", feat2_desc: "Klassisch, nordisch, modern oder minimalistisch – Sie wählen.",
    feat3_title: "KI-Texte & Logo", feat3_desc: "Wir schreiben alle Texte und erstellen bei Bedarf ein Logo.",
    feat4_title: "Bewertungen", feat4_desc: "Kunden bewerten nach dem Besuch – direkt auf Ihrer Seite.",
    how_title: "So einfach geht's",
    how1: "Fotos & Infos senden", how2: "Design wählen", how3: "Seite geht online", how4: "Termine erhalten",
    new_partners: "Neue Partner", ads: "Angebote & Aktionen",
    salons_title: "Unsere Salons", salons_sub: "Finden Sie einen Friseursalon in Ihrer Nähe",
    city_all: "Alle Städte", view_grid: "Kacheln", view_map: "Karte",
    book_btn: "Termin buchen", no_salons: "Noch keine Salons eingetragen.",
    pricing_title: "Preisübersicht",
    appt_desc: "Online-Terminbuchung + Bestätigungs-E-Mail + Bewertungssystem",
    setup: "Einrichtung", annual: "/ Jahr",
    footer: "© 2026 FriseurDeutschland. Alle Rechte vorbehalten.",
    login_title: "Anmelden", email: "E-Mail", password: "Passwort",
    login_btn: "Anmelden", logging_in: "Wird angemeldet…", login_error: "Anmeldung fehlgeschlagen.",
    no_account: "Noch kein Konto?",
    register_title: "Konto erstellen", password2: "Passwort wiederholen",
    register_btn: "Registrieren", registering: "Wird registriert…",
    have_account: "Haben Sie bereits ein Konto?", pw_mismatch: "Passwörter stimmen nicht überein.",
    my_sites: "Meine Websites", salon: "Salon", type: "Typ", status: "Status", site: "Website", date: "Datum",
    no_sites: "Noch keine Website vorhanden.",
    new_site: "Neue Website erstellen",
    new_site_desc: "Erstellen Sie eine professionelle Website für Ihren Friseursalon. Nach Zahlung der Einrichtungsgebühr startet der Prozess.",
    new_site_btn: "Neue Website →",
    no_permission: "Die Selbstverwaltung ist für Ihr Konto deaktiviert. Kontaktieren Sie uns für eine neue Website.",
    loading: "Wird geladen…",
    select_type: "Website-Typ auswählen", confirm_payment: "Zahlung bestätigen",
    site_type: "Website-Typ", setup_fee: "Einrichtungsgebühr", annual_fee: "Jahresgebühr (ab Ende Jahr 1)",
    pay_info: 'Nach dem Klick auf "Bezahlen" öffnet sich das PayPal-Fenster.',
    back: "Zurück", pay_btn: "Mit PayPal bezahlen", next: "Weiter", cancel: "Abbrechen",
    done_title: "Zahlung erhalten!", done_desc: "Ihr Website-Prozess wurde gestartet. Wir melden uns in Kürze.",
    ok: "OK", error_title: "Fehler aufgetreten", close: "Schließen", paypal_loading: "PayPal wird geladen…",
    fill_info: "Daten eingeben", edit_info: "Bearbeiten",
    cancel_project: "Projekt stornieren",
    cancel_confirm: "Möchten Sie dieses Projekt wirklich stornieren?",
    form_title: "Salondaten",
    salon_name_label: "Salonname", address_label: "Adresse", phone_label: "Telefon",
    salon_type_label: "Salontyp", description_label: "Beschreibung", hours_label: "Öffnungszeiten",
    closed: "Geschlossen", submit_info: "Absenden", saving: "Wird gespeichert…",
    saved_title: "Daten gespeichert!", saved_desc: "Wir beginnen nun mit der Erstellung Ihrer Website.",
    info_status: "Daten eingereicht", action: "Aktion",
  },
  en: {
    login: "Sign in", register: "Register", logout: "Sign out", dashboard: "My Websites",
    hero_title: "Professional website\nfor your hair salon",
    hero_sub: "Send your photos and details – your mobile-friendly hair salon website goes live in minutes.",
    hero_cta: "Get started", hero_cta2: "Sign in",
    features_title: "Everything your salon needs",
    feat1_title: "Online booking 24/7", feat1_desc: "Clients book anytime – no phone calls needed.",
    feat2_title: "5 modern designs", feat2_desc: "Classic, Nordic, modern or minimal – you choose.",
    feat3_title: "AI texts & logo", feat3_desc: "We write all texts and create a logo if needed.",
    feat4_title: "Reviews", feat4_desc: "Clients rate after their visit – directly on your page.",
    how_title: "How it works",
    how1: "Send photos & info", how2: "Choose design", how3: "Site goes live", how4: "Receive appointments",
    new_partners: "New Partners", ads: "Deals & Promotions",
    salons_title: "Our Salons", salons_sub: "Find a hair salon near you",
    city_all: "All cities", view_grid: "Grid", view_map: "Map",
    book_btn: "Book appointment", no_salons: "No salons listed yet.",
    pricing_title: "Pricing",
    appt_desc: "Online appointment booking + confirmation email + review system",
    setup: "Setup", annual: "/ year",
    footer: "© 2026 FriseurDeutschland. All rights reserved.",
    login_title: "Sign in", email: "Email", password: "Password",
    login_btn: "Sign in", logging_in: "Signing in…", login_error: "Sign in failed.",
    no_account: "Don't have an account?",
    register_title: "Create account", password2: "Confirm password",
    register_btn: "Register", registering: "Registering…",
    have_account: "Already have an account?", pw_mismatch: "Passwords do not match.",
    my_sites: "My Websites", salon: "Salon", type: "Type", status: "Status", site: "Site", date: "Date",
    no_sites: "No websites yet.",
    new_site: "Create new website",
    new_site_desc: "Create a professional website for your hair salon. The process starts after paying the setup fee.",
    new_site_btn: "New website →",
    no_permission: "Self-service creation is disabled. Contact us for a new website.",
    loading: "Loading…",
    select_type: "Select website type", confirm_payment: "Confirm payment",
    site_type: "Website type", setup_fee: "Setup fee", annual_fee: "Annual fee (from end of year 1)",
    pay_info: 'After clicking "Pay", the PayPal window will open.',
    back: "Back", pay_btn: "Pay with PayPal", next: "Continue", cancel: "Cancel",
    done_title: "Payment received!", done_desc: "Your website process has started. We will be in touch.",
    ok: "OK", error_title: "An error occurred", close: "Close", paypal_loading: "Loading PayPal…",
    fill_info: "Fill in details", edit_info: "Edit",
    cancel_project: "Cancel project", cancel_confirm: "Are you sure you want to cancel?",
    form_title: "Salon details",
    salon_name_label: "Salon name", address_label: "Address", phone_label: "Phone",
    salon_type_label: "Salon type", description_label: "Description", hours_label: "Opening hours",
    closed: "Closed", submit_info: "Submit", saving: "Saving…",
    saved_title: "Details saved!", saved_desc: "We will now start building your website.",
    info_status: "Info submitted", action: "Action",
  },
  tr: {
    login: "Giriş yap", register: "Kayıt ol", logout: "Çıkış yap", dashboard: "Web Sitelerim",
    hero_title: "Kuaförünüz için\nprofesyonel web sitesi",
    hero_sub: "Fotoğraflarınızı ve bilgilerinizi gönderin – dakikalar içinde yayında olan, mobil uyumlu kuaför web sitesine sahip olun.",
    hero_cta: "Hemen başlayın", hero_cta2: "Giriş yap",
    features_title: "Salonunuzun ihtiyacı olan her şey",
    feat1_title: "7/24 Online Randevu", feat1_desc: "Müşteriler istediği zaman randevu alır – telefon gerekmiyor.",
    feat2_title: "5 Modern Tasarım", feat2_desc: "Klasik, nordik, modern veya minimalist – siz seçin.",
    feat3_title: "Yapay Zeka Metin & Logo", feat3_desc: "Tüm metinleri biz yazarız, gerekirse logo da tasarlarız.",
    feat4_title: "Değerlendirmeler", feat4_desc: "Müşteriler ziyaret sonrası puanlama yapabilir.",
    how_title: "Nasıl çalışır?",
    how1: "Fotoğraf & bilgi gönder", how2: "Tasarım seç", how3: "Site yayına girer", how4: "Randevuları al",
    new_partners: "Yeni Partnerler", ads: "Reklamlar & Kampanyalar",
    salons_title: "Kuaförlerimiz", salons_sub: "Yakınınızdaki bir kuaförü bulun",
    city_all: "Tüm şehirler", view_grid: "Izgara", view_map: "Harita",
    book_btn: "Randevu al", no_salons: "Henüz kayıtlı kuaför yok.",
    pricing_title: "Fiyatlandırma",
    appt_desc: "Online randevu sistemi + onay e-postası + değerlendirme sistemi",
    setup: "Kurulum", annual: "/ yıl",
    footer: "© 2026 FriseurDeutschland. Tüm hakları saklıdır.",
    login_title: "Giriş yap", email: "E-posta", password: "Şifre",
    login_btn: "Giriş yap", logging_in: "Giriş yapılıyor…", login_error: "Giriş başarısız.",
    no_account: "Hesabınız yok mu?",
    register_title: "Hesap oluştur", password2: "Şifre tekrar",
    register_btn: "Kayıt ol", registering: "Kaydediliyor…",
    have_account: "Zaten hesabınız var mı?", pw_mismatch: "Şifreler eşleşmiyor.",
    my_sites: "Web Sitelerim", salon: "Kuaför", type: "Tip", status: "Durum", site: "Site", date: "Tarih",
    no_sites: "Henüz bir web siteniz yok.",
    new_site: "Yeni web sitesi oluştur",
    new_site_desc: "Kuaförünüz için profesyonel bir web sitesi oluşturun. Kurulum ücretini ödedikten sonra süreç başlar.",
    new_site_btn: "Yeni site oluştur →",
    no_permission: "Hesabınız için self-servis kapalı. Yeni site için bizimle iletişime geçin.",
    loading: "Yükleniyor…",
    select_type: "Site tipini seçin", confirm_payment: "Ödeme onayı",
    site_type: "Site tipi", setup_fee: "Kurulum ücreti", annual_fee: "Yıllık üyelik (1. yıl sonundan itibaren)",
    pay_info: '"Öde" butonuna tıkladıktan sonra PayPal ekranı açılacak.',
    back: "Geri", pay_btn: "PayPal ile öde", next: "Devam", cancel: "İptal",
    done_title: "Ödeme alındı!", done_desc: "Web siteniz için süreç başlatıldı. Kısa süre içinde sizinle iletişime geçeceğiz.",
    ok: "Tamam", error_title: "Hata oluştu", close: "Kapat", paypal_loading: "Yükleniyor…",
    fill_info: "Bilgileri Doldur", edit_info: "Düzenle",
    cancel_project: "İptal Et", cancel_confirm: "Bu projeyi iptal etmek istediğinizden emin misiniz?",
    form_title: "Kuaför Bilgileri",
    salon_name_label: "Kuaför Adı", address_label: "Adres", phone_label: "Telefon",
    salon_type_label: "Kuaför Tipi", description_label: "Açıklama", hours_label: "Çalışma Saatleri",
    closed: "Kapalı", submit_info: "Gönder", saving: "Kaydediliyor…",
    saved_title: "Bilgiler kaydedildi!", saved_desc: "Web sitenizin hazırlanması başlayacak.",
    info_status: "Bilgiler Gönderildi", action: "İşlem",
  },
};

const LangContext = createContext({ lang: "de", setLang: () => {}, tx: t.de });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState("de");
  useEffect(() => {
    const saved = localStorage.getItem("fd_lang");
    if (saved && LANGS.includes(saved)) setLangState(saved);
  }, []);
  function setLang(l) {
    setLangState(l);
    localStorage.setItem("fd_lang", l);
  }
  return (
    <LangContext.Provider value={{ lang, setLang, tx: t[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
