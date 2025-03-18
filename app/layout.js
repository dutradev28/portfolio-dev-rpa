import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import Head from 'next/head'

export const metadata = {
  title: "Luis Carlos Dutra Junior - Desenvolvedor RPA",
  description: "Portfólio de Luis Carlos Dutra Junior, Desenvolvedor RPA especializado em automação de processos e desenvolvimento de soluções escaláveis.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin /> 
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/jpg" href="./imgs/favicon.jpg" />
      </Head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}