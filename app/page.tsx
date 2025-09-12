import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SkillPassportLogo } from "@/components/skill-passport-logo"
import { WalletConnectionButton } from "@/components/wallet-connection-button"
import { Shield, Award, Users, Zap, CheckCircle, Globe, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <SkillPassportLogo className="w-8 h-8 text-primary bg-blue-200 rounded-lg border-1 border-blue-200" />
              <span className="font-bold text-xl text-foreground">Skill Badge</span>
            </Link>
            <WalletConnectionButton variant="default" className="text-blue-500" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="container mx-auto text-center max-w-5xl">
          <Badge variant="secondary" className="mb-8 bg-blue-100 text-blue-500 border-blue-300 hover:bg-primary/20 transition-all">
            <Sparkles className="w-3 h-3 mr-2" />
            Powered by Polkadot Ecosystem
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight">
            Your Skills,{" "}
            <span className="bg-blue-500 from-primary to-accent bg-clip-text text-transparent">
              Verified
            </span>
            <br />
            on Blockchain
          </h1>

          <p className="text-medium md:text-2xl mb-8 -mt-2 max-w-3xl mx-auto leading-relaxed font-sm">
            Create immutable digital credentials that showcase your expertise.
            <br />
            <span className="text-lg font-poppins">Build trust in the decentralized world with blockchain-backed verification.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-18 -mt-3">
            <Button size="lg" className="bg-blue-500 h-14 px-8 text-lg font-semibold rounded-xl">
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-lg border-1 border-blue-300 text-primary hover:bg-transperent hover:text-blue foreground bg-transparent rounded-xl"
              asChild
            >
              <Link href='/dashboard'>View Dashboard</Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-2">
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border-1 border-blue-300 from-background to-muted/30">
              <CheckCircle className="w-8 h-8 text-primary" />
              <span className="font-semibold text-foreground">Blockchain Verified</span>
              <span className="text-sm text-muted-foreground text-center">Immutable proof of authenticity</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border-1 border-blue-300 from-background to-muted/30">
              <Shield className="w-8 h-8 text-primary" />
              <span className="font-semibold text-foreground">Tamper Proof</span>
              <span className="text-sm text-muted-foreground text-center">Cryptographically secured</span>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl from-background to-muted/30 border-1 border-blue-300">
              <Globe className="w-8 h-8 text-primary" />
              <span className="font-semibold text-foreground">Globally Recognized</span>
              <span className="text-sm text-muted-foreground text-center">Universal acceptance</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
              Why Choose <span className="text-blue-500">Skill Passport?</span>
            </h2>
            <p className="text-bold text-gray-900 max-w-3xl mx-auto font-sm">
              Leverage Polkadot's cutting-edge technology to create verifiable credentials that matter
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-8">
            <Card className="group border-1 border-blue-300 hover:bg-blue-200 bg-gradient-to-b from-background to-muted/20 hover:from-muted/20 hover:to-muted/40 transition-all duration-300 rounded-2xl overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_4px_8px_rgba(59,130,246,0.2)] hover:translate-y-[-4px]">
              <CardHeader className="p-8">
                <div className="w-16 h-16 border-2 border-blue-300 hover:bg-blue-200 bg-blue-100 from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-blue-500 font-semibold mb-3">Blockchain Security</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Your credentials are secured by Polkadot's robust infrastructure, ensuring they can never be forged or compromised.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-1 border-blue-300 hover:bg-blue-200 bg-gradient-to-b from-background to-muted/20 hover:from-muted/20 hover:to-muted/40 transition-all duration-300 rounded-2xl overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_4px_8px_rgba(59,130,246,0.2)] hover:translate-y-[-4px]">
              <CardHeader className="p-8">
                <div className="w-16 h-16 border-2 border-blue-300 hover:bg-blue-200 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-blue-500 font-semibold mb-3">Digital Badges</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Create stunning, professional digital badges that represent your skills and achievements with visual impact.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-1 border-blue-300 hover:bg-blue-200 bg-gradient-to-b from-background to-muted/20 hover:from-muted/20 hover:to-muted/40 transition-all duration-300 rounded-2xl overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_4px_8px_rgba(59,130,246,0.2)] hover:translate-y-[-4px]">
              <CardHeader className="p-8">
                <div className="w-16 h-16 border-2 border-blue-300 hover:bg-blue-200 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-blue-500 font-semibold mb-3">Global Recognition</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Share verified credentials across platforms worldwide. Build instant trust with employers and collaborators.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-1 border-blue-300 hover:bg-blue-200 bg-gradient-to-b from-background to-muted/20 hover:from-muted/20 hover:to-muted/40 transition-all duration-300 rounded-2xl overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_4px_8px_rgba(59,130,246,0.2)] hover:translate-y-[-4px]">
              <CardHeader className="p-8">
                <div className="w-16 h-16 border-2 border-blue-300 hover:bg-blue-200 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-xl text-blue-500 font-semibold mb-3">Instant Verification</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Enable instant credential verification without lengthy processes. Save time for everyone involved.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-1 border-blue-300 hover:bg-blue-200 bg-gradient-to-b from-background to-muted/20 hover:from-muted/20 hover:to-muted/40 transition-all duration-300 rounded-2xl overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_4px_8px_rgba(59,130,246,0.2)] hover:translate-y-[-4px]">
              <CardHeader className="p-8">
                <div className="w-16 h-16 border-2 border-blue-300 hover:bg-blue-200 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-blue-500 font-semibold mb-3">Full Ownership</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Complete control over your credentials. No central authority can revoke or modify your achievements.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-1 border-blue-300 hover:bg-blue-200 bg-gradient-to-b from-background to-muted/20 hover:from-muted/20 hover:to-muted/40 transition-all duration-300 rounded-2xl overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_4px_8px_rgba(59,130,246,0.2)] hover:translate-y-[-4px]">
              <CardHeader className="p-8">
                <div className="w-16 h-16 border-2 border-blue-300 hover:bg-blue-200 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-xl text-blue-500 font-semibold mb-3">Seamless Integration</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  Integrate effortlessly with existing HR systems and professional networks through open standards.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-1 border-blue-300 rounded-lg w-auto mx-13 mb-24 bg-blue-100 from-background to-muted/60 border border-blue-300 shadow-[0_0_30px_rgba(59,130,246,0.15] hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] transition-shadow duration-500">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-500 mb-2">10+</div>
              <div className="text-lg text-muted-foreground">Credentials Issued</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-500 mb-2">2+</div>
              <div className="text-lg text-muted-foreground">Organizations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-500 mb-2">99.5%</div>
              <div className="text-lg text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
            Ready to Build Your
            <br />
            <span className="bg-blue-500 from-primary to-accent bg-clip-text text-transparent">
              Digital Reputation?
            </span>
          </h2>
          <p className="text-xl  mb-8 max-w-2xl mx-auto font-poppins">
            Join thousands of professionals leveraging blockchain technology for credential verification.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <WalletConnectionButton variant="default" size="lg" className="h-10 px-8 text-lg text-blue-500 rounded-xl" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-muted/20 py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <Link href="/" className="flex items-center gap-3 mb-6 md:mb-0">
              <SkillPassportLogo className="w-8 h-8 text-primary bg-blue-200 rounded-lg border-1 border-blue-200" />
              <span className="font-bold text-xl text-foreground">Skill Badge</span>
            </Link>

            <div className="flex gap-8 text-muted-foreground">
              <Link href="/profile" className="hover:text-primary transition-colors font-medium">
                Privacy
              </Link>
              <Link href="/dashboard" className="hover:text-primary transition-colors font-medium">
                Terms
              </Link>
              <Link href="/mint" className="hover:text-primary transition-colors font-medium">
                Support
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors font-medium"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}