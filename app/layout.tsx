import "./globals.css";
import AssistantIA from "@/components/AssistantIA";

export const metadata = {
  title: "Orientation Sénégal",
  description: "Trouve la filière qui te correspond après le bac",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        {children}
        <AssistantIA />
      </body>
    </html>
  );
}