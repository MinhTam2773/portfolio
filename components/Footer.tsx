import { ArrowUp, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-40 overflow-hidden border-t border-border">
      <div className="container-custom pt-20 pb-10">
        <p className="annot mb-8 flex items-center gap-3">
          <span className="beacon inline-block h-2 w-2 bg-primary" />
          End of survey · open to conversations
        </p>

        <a
          href="mailto:tamnguyen277353@gmail.com"
          data-cursor="WRITE TO ME"
          className="group block font-serif text-[clamp(3.5rem,11vw,10rem)] leading-[0.85] tracking-[-0.035em]"
        >
          Let&apos;s build
          <br />
          <span className="italic text-primary transition-colors duration-500 group-hover:text-foreground">something</span>
          <ArrowUpRight className="ml-2 inline-block h-[0.6em] w-[0.6em] align-baseline text-primary transition-transform duration-500 group-hover:-translate-y-2 group-hover:translate-x-2" />
        </a>

        <div className="mt-16 grid grid-cols-2 gap-8 border-t border-border pt-8 md:grid-cols-4">
          {[
            { label: "Mail", value: "tamnguyen277353@gmail.com", href: "mailto:tamnguyen277353@gmail.com" },
            { label: "GitHub", value: "MinhTam2773", href: "https://github.com/MinhTam2773" },
            { label: "LinkedIn", value: "minhtam-dev", href: "https://www.linkedin.com/in/minhtam-dev/" },
            { label: "Resume", value: "PDF ↓", href: "/Resume_Minh_Tam_Nguyen.pdf" },
          ].map(({ label, value, href }) => (
            <div key={label} className="min-w-0">
              <p className="annot mb-2">{label}</p>
              <a
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                className="block truncate text-sm text-foreground transition-colors hover:text-primary"
              >
                {value}
              </a>
            </div>
          ))}
        </div>

        <div className="annot mt-16 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Minh Tam Nguyen · Surveyed in Calgary, 51.04°N</p>
          <p className="hidden text-foreground/30 md:block">Psst — type “fire”</p>
          <a href="#" data-cursor="TO SUMMIT" className="inline-flex items-center gap-2 text-foreground transition-colors hover:text-primary">
            Back to summit <ArrowUp className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
