import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { 
  Home, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  Calculator,
  ArrowRight,
  FileText,
  PoundSterling,
  Building2,
  HandHeart,
  Globe,
  CheckCircle,
  Target,
  Eye,
  Handshake
} from "lucide-react";

const Index = () => {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    service: "",
    language: "",
    message: ""
  });

  const languages = [
    { name: "Hindi", flag: "🇮🇳" },
    { name: "Urdu", flag: "🇵🇰" },
    { name: "Tamil", flag: "🇮🇳" },
    { name: "Telugu", flag: "🇮🇳" },
    { name: "Kannada", flag: "🇮🇳" },
    { name: "Malayalam", flag: "🇮🇳" },
    { name: "Bengali", flag: "🇧🇩" },
    { name: "Panjabi", flag: "🇮🇳" },
    { name: "Gujarati", flag: "🇮🇳" },
    { name: "Arabic", flag: "🇸🇦" },
    { name: "Malay", flag: "🇲🇾" },
    { name: "Shona", flag: "🇿🇼" },
    { name: "Akan", flag: "🇬🇭" },
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!contactForm.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!contactForm.email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      // Submit to backend API
      // In development, use proxy from vite.config.ts, otherwise use env variable or default
      const apiUrl = import.meta.env.PROD 
        ? (import.meta.env.VITE_API_URL || 'http://localhost:3001')
        : ''; // Empty string uses relative path, which will use Vite proxy in dev
      
      const response = await fetch(`${apiUrl}/api/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          service: contactForm.service || undefined,
          language: contactForm.language || undefined,
          message: contactForm.message || undefined,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to submit contact form';
        let errorDetails = null;
        
        // Read the response body only once
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        
        try {
          if (isJson) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
            errorDetails = errorData.details || errorData.errors;
          } else {
            const text = await response.text();
            errorMessage = text || response.statusText || `Server error (${response.status})`;
          }
        } catch (parseError) {
          // If parsing fails, use status text
          errorMessage = response.statusText || `Server error (${response.status})`;
        }
        
        // Log detailed error for debugging
        console.error('Server error response:', {
          status: response.status,
          statusText: response.statusText,
          message: errorMessage,
          details: errorDetails
        });
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Reset form
      setContactForm({
        name: "",
        email: "",
        service: "",
        language: "",
        message: ""
      });

      // Show success message
      toast.success("Thank you for contacting us! We'll get back to you soon.");
    } catch (error) {
      console.error('Error submitting contact form:', error);
      
      // More specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error("Cannot connect to server. Please make sure the backend API is running on port 3001.");
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to submit your message. Please try again later.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="py-4 border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Home className="h-6 w-6 text-primary" />
            <h1 className="font-serif text-2xl font-bold text-foreground">MovWise</h1>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">Services</a>
            <Link to="/estimator" className="text-muted-foreground hover:text-foreground transition-colors">ILR Calculator</Link>
            <a href="#languages" className="text-muted-foreground hover:text-foreground transition-colors">Languages</a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </nav>
          <a href="mailto:contact@movwise.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            contact@movwise.com
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-background to-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 max-w-3xl mx-auto text-foreground">
            Your Complete UK Settlement Partner
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Helping skilled immigrant workers settle in the UK swiftly with expert guidance on immigration, property, mortgages, and integration support.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/estimator">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3">
                Check Your ILR Eligibility
              </Button>
            </Link>
            <a href="#services">
              <Button size="lg" variant="outline" className="px-6 py-3">
                Explore Our Services
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4 text-foreground">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive support for every step of your UK settlement journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Immigration Service */}
            <Card className="text-center hover:shadow-lg transition-shadow p-6">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Immigration Advice</h3>
              <p className="text-muted-foreground mb-4">
                Expert guidance on visas, ILR applications, and citizenship pathways including Innovator Visa support.
              </p>
              <Button variant="outline" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Find Your Immigration Adviser
              </Button>
            </Card>
            
            {/* Mortgage Service */}
            <Card className="text-center hover:shadow-lg transition-shadow p-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <PoundSterling className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Mortgage Guidance</h3>
              <p className="text-muted-foreground mb-4">
                Specialist mortgage advice for newcomers, even without extensive UK credit history.
              </p>
              <Button variant="outline" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Get a Mortgage Quote
              </Button>
            </Card>
            
            {/* Property Service */}
            <Card className="text-center hover:shadow-lg transition-shadow p-6">
              <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Property Legal Help</h3>
              <p className="text-muted-foreground mb-4">
                Expert conveyancing services to ensure your property purchase is legally sound and stress-free.
              </p>
              <Button variant="outline" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Find a Property Solicitor
              </Button>
            </Card>
            
            {/* Support Service */}
            <Card className="text-center hover:shadow-lg transition-shadow p-6">
              <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <HandHeart className="h-10 w-10 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Integration Support</h3>
              <p className="text-muted-foreground mb-4">
                Volunteering opportunities and resources to accelerate your settlement and ILR application.
              </p>
              <Button variant="outline" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Explore Support Options
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Languages Section */}
      <section id="languages" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4 text-foreground">We Speak Your Language</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect with professionals who understand both UK regulations and your cultural context
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <Card className="p-6 bg-muted/30">
                <div className="relative w-full h-64 bg-blue-50 dark:bg-blue-950 rounded border border-border flex items-center justify-center">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <Globe className="h-12 w-12 text-primary mb-2 mx-auto" />
                    <p className="text-sm font-medium text-foreground">United Kingdom</p>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="lg:w-1/2">
              <h3 className="text-xl font-bold mb-4 text-foreground">Available Languages</h3>
              <div className="flex flex-wrap gap-4 justify-center mb-6">
                {languages.map((lang) => (
                  <div key={lang.name} className="flex flex-col items-center w-20">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2 text-2xl">
                      {lang.flag}
                    </div>
                    <span className="text-xs text-center text-muted-foreground">{lang.name}</span>
                  </div>
                ))}
              </div>
              
              <p className="mt-6 text-muted-foreground text-sm mb-4">
                And many more! Our network includes professionals fluent in over 20 languages to ensure you receive advice in the language you're most comfortable with.
              </p>
              
              <a href="#contact">
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Find an Adviser in Your Language
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ILR Calculator CTA Section */}
      <section id="calculator" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="font-serif text-3xl font-bold mb-4 text-foreground">ILR Eligibility Estimator</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Calculate your estimated Indefinite Leave to Remain eligibility based on the UK Home Office CP 1448 consultation paper
          </p>
          <Link to="/estimator">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg">
              Calculate Your ILR Score
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4 text-foreground">About MovWise</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              We are dedicated to helping skilled immigrant workers navigate the complexities of UK settlement with confidence and clarity.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Our Mission</h3>
              <p className="text-muted-foreground">
                To simplify the UK settlement process for skilled immigrants through integrated services and expert guidance.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Our Vision</h3>
              <p className="text-muted-foreground">
                A world where skilled immigrants can seamlessly transition to their new life in the UK.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Handshake className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Our Values</h3>
              <p className="text-muted-foreground">
                Integrity, expertise, cultural understanding, and commitment to our clients' success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-4 text-foreground">Get In Touch</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ready to start your UK settlement journey? Contact us today for personalized assistance.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 text-foreground">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <a href="mailto:contact@movwise.com" className="text-muted-foreground hover:text-primary transition-colors">
                      contact@movwise.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Phone</p>
                    <p className="text-muted-foreground">+44 20 1234 5678</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Address</p>
                    <p className="text-muted-foreground">123 Settlement Street, London, UK</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-bold mb-2 text-foreground">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 text-foreground">Send Us a Message</h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="contact-name" className="text-foreground">Your Name</Label>
                  <Input
                    id="contact-name"
                    type="text"
                    placeholder="Your full name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="bg-background"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact-email" className="text-foreground">Your Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="bg-background"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact-service" className="text-foreground">Service Interested In</Label>
                  <Select 
                    value={contactForm.service}
                    onValueChange={(value) => setContactForm({ ...contactForm, service: value })}
                  >
                    <SelectTrigger id="contact-service" className="bg-background">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immigration">Immigration Advice</SelectItem>
                      <SelectItem value="mortgage">Mortgage Guidance</SelectItem>
                      <SelectItem value="property">Property Legal Help</SelectItem>
                      <SelectItem value="support">Integration Support</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="contact-language" className="text-foreground">Preferred Language</Label>
                  <Select 
                    value={contactForm.language}
                    onValueChange={(value) => setContactForm({ ...contactForm, language: value })}
                  >
                    <SelectTrigger id="contact-language" className="bg-background">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.name} value={lang.name.toLowerCase()}>
                          {lang.flag} {lang.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="english">🇬🇧 English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="contact-message" className="text-foreground">Message</Label>
                  <Textarea
                    id="contact-message"
                    rows={4}
                    placeholder="How can we help you?"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="bg-background"
                  />
                </div>
                
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Send Message
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-xl font-bold text-foreground">MovWise</h2>
              </div>
              <p className="text-muted-foreground max-w-md">
                Providing expert guidance on UK immigration pathways and settlement options.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-3 text-foreground">Services</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#services" className="hover:text-foreground transition-colors">ILR Applications</a></li>
                  <li><a href="#services" className="hover:text-foreground transition-colors">Citizenship</a></li>
                  <li><a href="#services" className="hover:text-foreground transition-colors">Visa Extensions</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-foreground">Resources</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link to="/estimator" className="hover:text-foreground transition-colors">ILR Calculator</Link></li>
                  <li><a href="#about" className="hover:text-foreground transition-colors">Guides</a></li>
                  <li><a href="#about" className="hover:text-foreground transition-colors">News</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-foreground">Company</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#about" className="hover:text-foreground transition-colors">About Us</a></li>
                  <li><a href="#contact" className="hover:text-foreground transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-6 text-sm text-muted-foreground text-center">
            <p>© 2025 MovWise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
