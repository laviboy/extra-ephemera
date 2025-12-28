import { useState } from "react";
import { useAuth } from "../../stores/useAuth";
import { getSupabase } from "../../lib/supabaseClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  CheckCircle2,
  Globe,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Star,
  Plane,
  Award,
  Send,
  Mail,
  Phone,
  Briefcase,
} from "lucide-react";

export default function BecomeAgent() {
  const user = useAuth((s) => s.user);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    experience: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Properly implement agent application flow with form validation
    // - Add proper form validation (required fields, email format, etc.)
    // - Store application data (formData) in database
    // - Add application review/approval process
    // - Send email notification to admin and applicant
    // - Create agent profile with additional details (specialties, bio, etc.)
    // - Add verification/approval workflow
    // - Show application status tracking
    // For now: Bypassing form validation and directly updating role to agent

    if (!user?.id) {
      console.error("User not logged in");
      return;
    }

    try {
      setIsSubmitting(true);
      const supabase = getSupabase();

      // Update user role to agent (bypassing form validation for now)
      const { error: userError } = await supabase
        .from("users")
        .update({ role: "agent" })
        .eq("id", user.id);

      if (userError) throw userError;

      // Update the auth store
      const { setUser } = useAuth.getState();
      setUser({
        ...user,
        role: "agent",
      });

      setApplicationSubmitted(true);
    } catch (error) {
      console.error("Error updating user role:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Competitive Commission",
      description: "Earn up to 25% commission on every booking you facilitate",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Access to Community",
      description:
        "Connect with a global network of travelers and fellow agents",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Destinations",
      description: "Curate trips to hundreds of destinations worldwide",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Growth Support",
      description: "Marketing tools and resources to grow your business",
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Flexible Schedule",
      description: "Work on your own terms and set your own hours",
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Recognition Program",
      description: "Get recognized and rewarded for outstanding performance",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Submit Application",
      description:
        "Fill out the application form below with your details and experience",
    },
    {
      number: "02",
      title: "Review Process",
      description:
        "Our team will review your application within 3-5 business days",
    },
    {
      number: "03",
      title: "Onboarding",
      description:
        "Complete a brief training session to learn our platform and best practices",
    },
    {
      number: "04",
      title: "Start Earning",
      description:
        "Begin creating and managing travel groups, and earn commissions immediately",
    },
  ];

  const stats = [
    { value: "500+", label: "Active Agents" },
    { value: "$2M+", label: "Paid in Commissions" },
    { value: "150+", label: "Countries" },
    { value: "4.9/5", label: "Agent Satisfaction" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-rose-600 to-rose-800 py-20 px-6 text-white">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30">
            Join Our Network
          </Badge>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Become a Travel Agent
          </h1>
          <p className="mb-8 text-lg text-rose-100 md:text-xl">
            Turn your passion for travel into a thriving business. Help others
            explore the world while earning competitive commissions.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-rose-700 hover:bg-rose-50"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e as any);
              }}
              disabled={isSubmitting}
            >
              <Send className="mr-2 h-5 w-5" />
              {isSubmitting ? "Processing..." : "Apply Now"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-black hover:bg-white/10"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-2 text-3xl font-bold text-rose-600">
                {stat.value}
              </div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-slate-900">
            Why Join Us?
          </h2>
          <p className="text-lg text-slate-600">
            We provide everything you need to succeed as a travel agent
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="border-2 transition-all hover:border-rose-200 hover:shadow-lg"
            >
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                  {benefit.icon}
                </div>
                <CardTitle className="text-lg">{benefit.title}</CardTitle>
                <CardDescription>{benefit.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-slate-50 py-16 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-slate-900">
              How It Works
            </h2>
            <p className="text-lg text-slate-600">
              Simple steps to start your journey as a travel agent
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-600 text-2xl font-bold text-white">
                  {step.number}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-slate-600">{step.description}</p>
                {index < steps.length - 1 && (
                  <div
                    className="absolute top-8 left-16 hidden h-0.5 w-full bg-rose-200 lg:block"
                    style={{ width: "calc(100% - 4rem)" }}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-slate-900">
            What Our Agents Say
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              name: "Sarah Johnson",
              role: "Travel Agent",
              location: "New York, USA",
              quote:
                "Best decision I've made! The platform is intuitive and the commission structure is fantastic.",
              rating: 5,
            },
            {
              name: "Michael Chen",
              role: "Senior Agent",
              location: "Singapore",
              quote:
                "I've doubled my income in just 6 months. The support team is always there when I need them.",
              rating: 5,
            },
            {
              name: "Emma Williams",
              role: "Travel Agent",
              location: "London, UK",
              quote:
                "The flexibility to work from anywhere while helping people explore the world is priceless.",
              rating: 5,
            },
          ].map((testimonial, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="mb-3 flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <CardDescription className="text-base italic">
                  "{testimonial.quote}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-semibold text-slate-900">
                  {testimonial.name}
                </div>
                <div className="text-sm text-slate-500">{testimonial.role}</div>
                <div className="text-xs text-slate-400">
                  {testimonial.location}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Application Form Section */}
      <div
        id="application-form"
        className="bg-gradient-to-b from-slate-50 to-white py-16 px-6"
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-3xl font-bold text-slate-900">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-slate-600">
              Fill out the application form and we'll get back to you within 3-5
              business days
            </p>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-rose-600" />
                Agent Application Form
              </CardTitle>
              <CardDescription>
                Tell us about yourself and your travel experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applicationSubmitted ? (
                <div className="py-12 text-center">
                  <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-600" />
                  <h3 className="mb-2 text-xl font-semibold text-slate-900">
                    Application Submitted!
                  </h3>
                  <p className="text-slate-600">
                    Thank you for your interest. We'll review your application
                    and get back to you within 3-5 business days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        required
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company (if applicable)</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                        placeholder="Your Travel Agency"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">
                      Travel / Sales Experience{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="experience"
                      required
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData({ ...formData, experience: e.target.value })
                      }
                      placeholder="e.g., 5 years in hospitality, Travel blogger, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Why do you want to become a travel agent?{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      required
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Tell us about your passion for travel and what you hope to achieve..."
                      rows={5}
                    />
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                      <span className="text-red-500">*</span> Required fields
                    </p>
                    <Button
                      type="submit"
                      size="lg"
                      className="gap-2"
                      disabled={true}
                    >
                      <Send className="h-4 w-4" />
                      Coming Soon
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="mt-8 text-center">
            <p className="mb-4 text-slate-600">
              Have questions? Get in touch with us
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-700">
              <a
                href="mailto:agents@extraephemera.com"
                className="flex items-center gap-2 hover:text-rose-600"
              >
                <Mail className="h-4 w-4" />
                agents@extraephemera.com
              </a>
              <a
                href="tel:+15551234567"
                className="flex items-center gap-2 hover:text-rose-600"
              >
                <Phone className="h-4 w-4" />
                +1 (555) 123-4567
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog
        open={applicationSubmitted}
        onOpenChange={setApplicationSubmitted}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <DialogTitle className="text-center text-2xl">
              Welcome to the Team!
            </DialogTitle>
            <DialogDescription className="text-center">
              Congratulations! You're now a travel agent. You can now access
              your CRM dashboard and start managing your travel packages and
              bookings.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex justify-center">
            <Button
              size="lg"
              onClick={() => {
                setApplicationSubmitted(false);
                window.location.href = "/";
              }}
              className="w-full sm:w-auto"
            >
              Okay, Let's Go!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
