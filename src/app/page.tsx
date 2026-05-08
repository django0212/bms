import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Building2, Calendar, ShieldCheck, Users, Zap, BarChart3 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <Link className="flex items-center justify-center" href="#">
          <Building2 className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold text-xl">BookMyCampus</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4 flex items-center" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4 flex items-center" href="#about">
            About
          </Link>
          <Link href="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://picsum.photos/seed/campus/1920/1080"
              alt="University Campus"
              fill
              className="object-cover opacity-20"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background"></div>
          </div>
          
          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">

                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 pb-2">
                  Campus Facility Management, <br /> Reimagined.
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                  Streamline bookings, manage access, and optimize resource utilization for your university. 
                  The all-in-one platform for modern campuses.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/login">
                  <Button size="lg" className="h-12 px-8 shadow-lg hover:shadow-xl transition-all">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="h-12 px-8 backdrop-blur-sm bg-background/50">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section className="w-full py-12 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto">
             <div className="relative rounded-xl overflow-hidden shadow-2xl border border-border/50">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 mix-blend-overlay"></div>
                <Image 
                  src="https://picsum.photos/seed/dashboard/1200/600"
                  alt="Dashboard Preview"
                  width={1200}
                  height={600}
                  className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <div className="bg-background/80 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/20 text-center max-w-md transform translate-y-12">
                      <h3 className="text-2xl font-bold mb-2">Powerful Analytics</h3>
                      <p className="text-muted-foreground">Gain insights into facility usage and optimize campus resources.</p>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Powerful Features</h2>
              <p className="mt-4 text-muted-foreground md:text-lg">Everything you need to manage your campus effectively.</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-none shadow-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                <CardHeader>
                  <Calendar className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Smart Scheduling</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Effortlessly book classrooms, auditoriums, and labs. Real-time availability checks prevent double bookings.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                <CardHeader>
                  <ShieldCheck className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Role-Based Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Granular permissions for Super Admins, University Admins, and Students. Secure and compliant.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Multi-Tenant Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Built for scale. Host multiple universities on a single platform with isolated data and custom branding.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                <CardHeader>
                  <Zap className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Instant Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Automated workflows for facility approvals. Reduce wait times and administrative overhead.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Usage Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Detailed reports on facility utilization. Make data-driven decisions for campus planning.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                <CardHeader>
                  <Building2 className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Event Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Organize and promote campus events. Manage registrations, capacity, and batch-specific access.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats / Trust Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center">
              <div className="space-y-2">
                <h3 className="text-4xl font-bold text-primary">50+</h3>
                <p className="text-muted-foreground">Universities</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-bold text-primary">10k+</h3>
                <p className="text-muted-foreground">Daily Bookings</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-bold text-primary">100k+</h3>
                <p className="text-muted-foreground">Students</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-bold text-primary">99.9%</h3>
                <p className="text-muted-foreground">Uptime</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 z-0"></div>
          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Ready to modernize your campus?</h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                  Join leading universities in transforming how they manage facilities.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Link href="/login">
                  <Button className="w-full h-11 shadow-lg" size="lg">
                    Get Started Now
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground">
                  Contact sales for enterprise deployment options.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© 2025 BookMyCampus. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
