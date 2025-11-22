import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Calculator, CheckCircle, Users, TrendingUp, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-6 w-6 text-primary" />
              <span className="font-serif text-2xl font-bold text-foreground">MovWise</span>
            </div>
            <a href="mailto:contact@movwise.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              contact@movwise.com
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Your Path to UK Settlement,
            <br />
            <span className="text-primary">Made Clear</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Calculate your Indefinite Leave to Remain eligibility with our comprehensive ILR Estimator, 
            based on the latest UK Home Office consultation paper CP 1448: "A Fairer Pathway to Settlement"
          </p>
          <Link to="/estimator">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg">
              Start Your ILR Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            Why Choose MovWise?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 bg-card border-border">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-3">
                CP 1448 Based
              </h3>
              <p className="text-muted-foreground">
                Our estimator follows the latest UK Home Office consultation paper, ensuring accuracy and relevance to current immigration policy
              </p>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-3">
                Detailed Scorecard
              </h3>
              <p className="text-muted-foreground">
                Get a comprehensive breakdown across Contribution, Residence, Integration, and Character categories
              </p>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-3">
                Family Inclusive
              </h3>
              <p className="text-muted-foreground">
                Calculate eligibility for main applicants, adult dependents, and children all in one place
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            How It Works
          </h2>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-accent rounded-full flex items-center justify-center">
                  <span className="font-bold text-accent-foreground">1</span>
                </div>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                  Enter Your Details
                </h3>
                <p className="text-muted-foreground">
                  Provide information about your salary, residence years, language skills, volunteering, and more
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-accent rounded-full flex items-center justify-center">
                  <span className="font-bold text-accent-foreground">2</span>
                </div>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                  Get Your Score
                </h3>
                <p className="text-muted-foreground">
                  Our algorithm calculates your points across four key categories based on CP 1448 guidelines
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-accent rounded-full flex items-center justify-center">
                  <span className="font-bold text-accent-foreground">3</span>
                </div>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                  Understand Your Path
                </h3>
                <p className="text-muted-foreground">
                  Receive personalized insights and estimated timeline for your ILR application
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-accent rounded-full flex items-center justify-center">
                  <span className="font-bold text-accent-foreground">4</span>
                </div>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                  Stay Updated
                </h3>
                <p className="text-muted-foreground">
                  Get free updates on policy changes and volunteering opportunities to improve your score
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Highlight */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            What We Calculate
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">3-Year Accelerated Pathway</h3>
                <p className="text-sm text-muted-foreground">For top earners (£120k+) and Innovator visa holders</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Contribution Points</h3>
                <p className="text-sm text-muted-foreground">Based on salary and UK mortgage ownership</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Residence History</h3>
                <p className="text-sm text-muted-foreground">Years in UK with National Insurance contributions</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Integration Score</h3>
                <p className="text-sm text-muted-foreground">English proficiency, volunteering, and public service</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Character Assessment</h3>
                <p className="text-sm text-muted-foreground">Clear mapping of penalties for negative factors</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Volunteering Benefits</h3>
                <p className="text-sm text-muted-foreground">Understand how 200+ hours can reduce wait time by ~1 year</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Plan Your UK Settlement Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Get your personalized ILR scorecard and estimated timeline in minutes
          </p>
          <Link to="/estimator">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg">
              Calculate Your ILR Score Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <span className="font-serif text-xl font-bold text-foreground">MovWise</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a href="mailto:contact@movwise.com" className="hover:text-primary transition-colors">
                contact@movwise.com
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 MovWise. Helping migrants settle in the UK.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;