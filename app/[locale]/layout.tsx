import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeaderSearchRedirect from '@/components/layout/HeaderSearchRedirect';
 
type Props = {
  children: React.ReactNode;
  params: Promise<{locale: "en" | "vi"}>;
};
 
export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <NextIntlClientProvider>
      <HeaderSearchRedirect />
      <Header locale={locale} />
      {children}
      <Footer locale={locale} />
    </NextIntlClientProvider>
  );
}
