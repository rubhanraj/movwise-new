import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Calculator, Mail, Phone, User, Users, Baby, PoundSterling, Calendar, Heart, Home, BookOpen, Briefcase, AlertTriangle, ShieldAlert } from "lucide-react";

interface FormData {
  // Main applicant
  mainApplicantSalary: string;
  mainApplicantResidenceYears: string;
  mainApplicantVolunteeringHours: string;
  mainApplicantMortgage: string;
  mainApplicantEnglishLevel: string;
  mainApplicantPublicService: string;
  mainApplicantBenefitsUse: string;
  mainApplicantCriminality: string;
  mainApplicantIllegalEntry: string;
  
  // Dependents
  adultDependents: string;
  childDependents: string;
  
  // Contact
  fullName: string;
  email: string;
  phone: string;
}

interface ScoreResult {
  contribution: number;
  residence: number;
  integration: number;
  character: number;
  total: number;
  eligibleFor3YearPathway: boolean;
  estimatedYearsToILR: number;
}

const Estimator = () => {
  const [showResults, setShowResults] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    mainApplicantSalary: "",
    mainApplicantResidenceYears: "",
    mainApplicantVolunteeringHours: "",
    mainApplicantMortgage: "no",
    mainApplicantEnglishLevel: "",
    mainApplicantPublicService: "no",
    mainApplicantBenefitsUse: "no",
    mainApplicantCriminality: "no",
    mainApplicantIllegalEntry: "no",
    adultDependents: "0",
    childDependents: "0",
    fullName: "",
    email: "",
    phone: ""
  });

  const calculateScore = (): ScoreResult => {
    let contribution = 0;
    let residence = 0;
    let integration = 0;
    let character = 0;

    // Contribution Score (based on salary - CP 1448)
    const salary = parseFloat(formData.mainApplicantSalary) || 0;
    if (salary >= 120000) {
      contribution = 100; // Top tax bracket - eligible for 3-year pathway
    } else if (salary >= 80000) {
      contribution = 80;
    } else if (salary >= 50000) {
      contribution = 60;
    } else if (salary >= 35000) {
      contribution = 40;
    } else if (salary >= 25000) {
      contribution = 20;
    }

    // Mortgage bonus
    if (formData.mainApplicantMortgage === "yes") {
      contribution += 10;
    }

    // Residence Score (years in UK with NI contributions)
    const years = parseFloat(formData.mainApplicantResidenceYears) || 0;
    residence = Math.min(years * 10, 100); // 10 points per year, max 100

    // Integration Score
    // English level
    const englishLevels: { [key: string]: number } = {
      "native": 30,
      "c2": 25,
      "c1": 20,
      "b2": 15,
      "b1": 10,
      "a2": 5
    };
    integration += englishLevels[formData.mainApplicantEnglishLevel] || 0;

    // Volunteering (CP 1448 mentions volunteering can reduce waiting time by ~1 year)
    const volunteeringHours = parseFloat(formData.mainApplicantVolunteeringHours) || 0;
    if (volunteeringHours >= 200) {
      integration += 30;
    } else if (volunteeringHours >= 100) {
      integration += 20;
    } else if (volunteeringHours >= 50) {
      integration += 10;
    }

    // Public service
    if (formData.mainApplicantPublicService === "yes") {
      integration += 20;
    }

    // Character Score (penalties for negative factors)
    character = 100; // Start at 100

    // Benefits use penalty
    if (formData.mainApplicantBenefitsUse === "yes") {
      character -= 30;
    }

    // Criminality penalty
    if (formData.mainApplicantCriminality === "yes") {
      character -= 50;
    }

    // Illegal entry penalty
    if (formData.mainApplicantIllegalEntry === "yes") {
      character -= 60;
    }

    character = Math.max(character, 0);

    const total = contribution + residence + integration + character;

    // Determine eligibility for 3-year pathway (top earners £120k+ or Innovator visa)
    const eligibleFor3YearPathway = salary >= 120000;

    // Estimate years to ILR based on total score and pathway
    let estimatedYears = 5; // Standard pathway
    if (eligibleFor3YearPathway) {
      estimatedYears = 3;
    } else if (total >= 350) {
      estimatedYears = 3.5;
    } else if (total >= 300) {
      estimatedYears = 4;
    } else if (total >= 250) {
      estimatedYears = 4.5;
    }

    // Volunteering reduction (~1 year as per CP 1448)
    if (volunteeringHours >= 200) {
      estimatedYears = Math.max(3, estimatedYears - 1);
    }

    return {
      contribution,
      residence,
      integration,
      character,
      total,
      eligibleFor3YearPathway,
      estimatedYearsToILR: estimatedYears
    };
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\d\s+()-]{10,}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!validatePhone(formData.phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    // Calculate score first
    const scoreResult = calculateScore();

    // Prepare data for API
    const submissionData = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      salary: parseFloat(formData.mainApplicantSalary) || undefined,
      mortgage: formData.mainApplicantMortgage || undefined,
      innovatorVisa: false, // Add checkbox if needed
      yearsResidence: parseFloat(formData.mainApplicantResidenceYears) || undefined,
      englishLevel: formData.mainApplicantEnglishLevel || undefined,
      volunteeringHours: parseFloat(formData.mainApplicantVolunteeringHours) || undefined,
      publicService: formData.mainApplicantPublicService || undefined,
      lifeInUKPassed: true, // Add checkbox if needed
      benefitsUse: formData.mainApplicantBenefitsUse || undefined,
      criminality: formData.mainApplicantCriminality || undefined,
      illegalEntry: formData.mainApplicantIllegalEntry || undefined,
      previousBreaches: false, // Add checkbox if needed
      adultDependents: parseInt(formData.adultDependents) || 0,
      childDependents: parseInt(formData.childDependents) || 0,
      contributionScore: scoreResult.contribution,
      residenceScore: scoreResult.residence,
      integrationScore: scoreResult.integration,
      characterScore: scoreResult.character,
      totalScore: scoreResult.total,
      eligibleFor3YearPathway: scoreResult.eligibleFor3YearPathway,
      estimatedYearsToILR: scoreResult.estimatedYearsToILR,
      newsletter: true,
      volunteeringInterest: false,
    };

    try {
      // Submit to backend API
      // In development, use proxy from vite.config.ts, otherwise use env variable or default
      const apiUrl = import.meta.env.PROD 
        ? (import.meta.env.VITE_API_URL || 'http://localhost:3001')
        : ''; // Empty string uses relative path, which will use Vite proxy in dev
      const response = await fetch(`${apiUrl}/api/ilr/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Failed to save submission');
      }

      const result = await response.json();
      setShowResults(true);
      toast.success("Thank you for using MovWise.");
    } catch (error) {
      console.error('Error submitting form:', error);
      // Still show results even if save fails
      setShowResults(true);
      toast.warning("Results calculated, but failed to save. Results are still displayed.");
    }
  };

  const scoreResult = showResults ? calculateScore() : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <Calculator className="h-6 w-6 text-primary" />
              <span className="font-serif text-2xl font-bold text-foreground">MovWise</span>
            </a>
            <a href="mailto:contact@movwise.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              contact@movwise.com
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-3">
            ILR Eligibility Estimator
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Calculate your estimated Indefinite Leave to Remain eligibility based on the UK Home Office CP 1448 consultation paper: "A Fairer Pathway to Settlement"
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contribution Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <PoundSterling className="h-6 w-6 text-primary" />
              <h2 className="font-serif text-2xl font-bold text-foreground">Contribution</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="salary" className="text-foreground">Annual Salary (£)</Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="e.g., 45000"
                  value={formData.mainApplicantSalary}
                  onChange={(e) => setFormData({ ...formData, mainApplicantSalary: e.target.value })}
                  required
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  £120,000+ qualifies for 3-year pathway
                </p>
              </div>

              <div>
                <Label htmlFor="mortgage" className="text-foreground">UK Mortgage Holder?</Label>
                <Select 
                  value={formData.mainApplicantMortgage}
                  onValueChange={(value) => setFormData({ ...formData, mainApplicantMortgage: value })}
                >
                  <SelectTrigger id="mortgage" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Residence Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="h-6 w-6 text-primary" />
              <h2 className="font-serif text-2xl font-bold text-foreground">Residence</h2>
            </div>
            
            <div>
              <Label htmlFor="years" className="text-foreground">Years in UK with NI Contributions</Label>
              <Input
                id="years"
                type="number"
                step="0.1"
                placeholder="e.g., 5"
                value={formData.mainApplicantResidenceYears}
                onChange={(e) => setFormData({ ...formData, mainApplicantResidenceYears: e.target.value })}
                required
                className="bg-background"
              />
            </div>
          </Card>

          {/* Integration Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-6 w-6 text-primary" />
              <h2 className="font-serif text-2xl font-bold text-foreground">Integration</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="english" className="text-foreground">English Language Level</Label>
                <Select 
                  value={formData.mainApplicantEnglishLevel}
                  onValueChange={(value) => setFormData({ ...formData, mainApplicantEnglishLevel: value })}
                  required
                >
                  <SelectTrigger id="english" className="bg-background">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="native">Native Speaker</SelectItem>
                    <SelectItem value="c2">C2 (Proficiency)</SelectItem>
                    <SelectItem value="c1">C1 (Advanced)</SelectItem>
                    <SelectItem value="b2">B2 (Upper Intermediate)</SelectItem>
                    <SelectItem value="b1">B1 (Intermediate)</SelectItem>
                    <SelectItem value="a2">A2 (Elementary)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="volunteering" className="text-foreground">Volunteering Hours (Annual)</Label>
                <Input
                  id="volunteering"
                  type="number"
                  placeholder="e.g., 100"
                  value={formData.mainApplicantVolunteeringHours}
                  onChange={(e) => setFormData({ ...formData, mainApplicantVolunteeringHours: e.target.value })}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  200+ hours can reduce waiting time by ~1 year
                </p>
              </div>

              <div>
                <Label htmlFor="publicService" className="text-foreground">Public Service Employment?</Label>
                <Select 
                  value={formData.mainApplicantPublicService}
                  onValueChange={(value) => setFormData({ ...formData, mainApplicantPublicService: value })}
                >
                  <SelectTrigger id="publicService" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes (NHS, Education, etc.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Character Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <ShieldAlert className="h-6 w-6 text-primary" />
              <h2 className="font-serif text-2xl font-bold text-foreground">Character Assessment</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="benefits" className="text-foreground">Public Benefits Use?</Label>
                <Select 
                  value={formData.mainApplicantBenefitsUse}
                  onValueChange={(value) => setFormData({ ...formData, mainApplicantBenefitsUse: value })}
                >
                  <SelectTrigger id="benefits" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="criminality" className="text-foreground">Criminal Record?</Label>
                <Select 
                  value={formData.mainApplicantCriminality}
                  onValueChange={(value) => setFormData({ ...formData, mainApplicantCriminality: value })}
                >
                  <SelectTrigger id="criminality" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="illegalEntry" className="text-foreground">Illegal Entry History?</Label>
                <Select 
                  value={formData.mainApplicantIllegalEntry}
                  onValueChange={(value) => setFormData({ ...formData, mainApplicantIllegalEntry: value })}
                >
                  <SelectTrigger id="illegalEntry" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Dependents Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="font-serif text-2xl font-bold text-foreground">Dependents</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adults" className="text-foreground">Adult Dependents</Label>
                <Input
                  id="adults"
                  type="number"
                  min="0"
                  value={formData.adultDependents}
                  onChange={(e) => setFormData({ ...formData, adultDependents: e.target.value })}
                  className="bg-background"
                />
              </div>

              <div>
                <Label htmlFor="children" className="text-foreground">Child Dependents</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  value={formData.childDependents}
                  onChange={(e) => setFormData({ ...formData, childDependents: e.target.value })}
                  className="bg-background"
                />
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-6 bg-accent/10 border-accent">
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                View Your Results
              </h2>
              <p className="text-muted-foreground text-sm">
                Enter your contact details to see your ILR score and receive free updates on UK immigration pathways
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+44 1234 567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>
            </div>
          </Card>

          <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90">
            Calculate My ILR Score
          </Button>
        </form>
      </main>

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl text-foreground">Your ILR Scorecard</DialogTitle>
            <DialogDescription>
              Based on the UK Home Office CP 1448 consultation paper
            </DialogDescription>
          </DialogHeader>

          {scoreResult && (
            <div className="space-y-6">
              {/* Total Score */}
              <div className="text-center p-6 bg-accent/10 rounded-lg border-2 border-accent">
                <div className="text-5xl font-bold text-foreground mb-2">
                  {scoreResult.total}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">
                  Total Points
                </div>
              </div>

              {/* Pathway Info */}
              {scoreResult.eligibleFor3YearPathway && (
                <div className="p-4 bg-primary/10 border border-primary rounded-lg">
                  <p className="text-sm font-semibold text-foreground">
                    ✓ Eligible for 3-Year Accelerated Pathway
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    As a top tax bracket earner (£120k+), you qualify for the fast-track settlement route
                  </p>
                </div>
              )}

              <div className="p-4 bg-card border rounded-lg">
                <p className="text-sm font-semibold text-foreground mb-1">
                  Estimated Time to ILR
                </p>
                <p className="text-2xl font-bold text-primary">
                  {scoreResult.estimatedYearsToILR} years
                </p>
              </div>

              {/* Score Breakdown */}
              <div className="space-y-3">
                <h3 className="font-serif text-xl font-bold text-foreground">Score Breakdown</h3>
                
                <div className="flex justify-between items-center p-3 bg-card rounded-lg border">
                  <div className="flex items-center gap-2">
                    <PoundSterling className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">Contribution</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">{scoreResult.contribution}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-card rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">Residence</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">{scoreResult.residence}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-card rounded-lg border">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">Integration</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">{scoreResult.integration}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-card rounded-lg border">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">Character</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">{scoreResult.character}</span>
                </div>
              </div>

              {/* Next Steps */}
              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold text-foreground mb-2">Next Steps</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• We'll send your detailed report to {formData.email}</li>
                  <li>• You'll receive free updates on CP 1448 implementation</li>
                  <li>• Learn about volunteering opportunities to reduce wait time</li>
                  <li>• Get personalized guidance for your ILR journey</li>
                </ul>
              </div>

              <Button 
                onClick={() => setShowResults(false)} 
                className="w-full bg-primary hover:bg-primary/90"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Estimator;