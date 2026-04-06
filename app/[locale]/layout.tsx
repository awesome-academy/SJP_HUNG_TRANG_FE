import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
 
type Props = {
  children: React.ReactNode;
  params: Promise<{locale: "en" | "vi"}>;
};
 
export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === "ADMIN"
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <NextIntlClientProvider>
      <Header locale={locale} isAdmin={isAdmin} />
      {children}
      <Footer locale={locale} />
    </NextIntlClientProvider>
  );
}
