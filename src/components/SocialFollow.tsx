import { Instagram, Facebook, Music2, ArrowRight } from "lucide-react";
import { companyConfig } from "@/lib/site-config";

export default function SocialFollow() {
  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      url: companyConfig.instagramUrl,
      description: "See our latest pool transformations",
      color: "from-pink-500 to-purple-500",
      hoverBg: "hover:bg-pink-50 dark:hover:bg-pink-950/20",
      iconColor: "text-pink-500",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: companyConfig.facebookUrl,
      description: "Join our pool community",
      color: "from-blue-600 to-blue-400",
      hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-950/20",
      iconColor: "text-blue-600",
    },
    {
      name: "TikTok",
      icon: Music2,
      url: companyConfig.tiktokUrl,
      description: "Watch behind-the-scenes content",
      color: "from-black to-gray-800 dark:from-white dark:to-gray-200",
      hoverBg: "hover:bg-slate-100 dark:hover:bg-slate-800",
      iconColor: "text-black dark:text-white",
    },
  ];

  return (
    <section id="social" className="py-24 bg-gradient-to-b from-background to-card/50">
      <div className="container-shell">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-4">
            Stay Connected
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Follow Our Journey
          </h2>
          <p className="text-lg text-muted-foreground">
            Get inspired by our daily pool transformations, tips, and behind-the-scenes magic.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {socialLinks.map(({ name, icon: Icon, url, description, color, hoverBg, iconColor }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative overflow-hidden rounded-[32px] border border-border bg-card p-8 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${hoverBg}`}
            >
              <div className={`absolute inset-x-0 -top-1 h-1 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 transition-opacity`} />
              
              <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-black tracking-tight mb-2 text-foreground">
                {name}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {description}
              </p>
              
              <div className="inline-flex items-center gap-2 text-sm font-bold text-foreground group-hover:text-blue-500 transition-colors">
                Follow Us <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
