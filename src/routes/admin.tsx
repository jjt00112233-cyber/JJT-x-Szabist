import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Trash2,
  CheckCircle,
  Phone,
  Building,
  Calendar,
  LogOut,
  RefreshCw,
  Coins,
  Users,
  MessageSquare,
  ExternalLink,
  LayoutDashboard,
  Receipt,
  Settings,
  Search,
  Menu,
  X,
  Target,
  ChevronRight,
  FileCheck,
  UploadCloud,
  Save,
  RotateCcw,
  Wallet,
  Share2,
  Layers,
} from "lucide-react";
import {
  adminLogin,
  getAdminData,
  addContributionAdmin,
  deleteContributionAdmin,
  deleteDonationRequestAdmin,
  updateCampaignConfigAdmin,
  updateAdminCredentials,
} from "@/lib/admin";
import { uploadPaymentScreenshot } from "@/lib/upload";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { SITE, formatRs, useCampaignConfig, MOBILE_WALLET_OPTIONS, formatWhatsAppUrl, type CampaignConfig } from "@/lib/site";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal | JJT × SZABIST Community" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type ContributionItem = {
  id: string;
  donor_label: string;
  amount: number;
  purpose: string | null;
  payment_proof_url: string | null;
  received_on: string;
};

type DonationRequestItem = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  donor_type: string;
  intended_amount: number | null;
  message: string | null;
  payment_proof_url: string | null;
  created_at: string;
};

type ActiveView = "dashboard" | "contributions" | "requests" | "settings";

function AdminPage() {
  const queryClient = useQueryClient();
  const publicConfig = useCampaignConfig();
  const [token, setToken] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // Campaign Configuration State (Dynamic)
  const [config, setConfig] = useState<CampaignConfig>(publicConfig);
  const [editConfigName, setEditConfigName] = useState(publicConfig.name);
  const [editConfigSupporting, setEditConfigSupporting] = useState(publicConfig.supporting);
  const [editConfigPhone, setEditConfigPhone] = useState(publicConfig.donationPhone);
  const [editConfigEmail, setEditConfigEmail] = useState(publicConfig.contactEmail);
  const [editConfigGoal, setEditConfigGoal] = useState(String(publicConfig.goal));
  const [editBankName, setEditBankName] = useState(publicConfig.bankName || SITE.bankName);
  const [editBankAccountTitle, setEditBankAccountTitle] = useState(publicConfig.bankAccountTitle || SITE.bankAccountTitle);
  const [editBankIdentifierType, setEditBankIdentifierType] = useState<"both" | "account_only" | "iban_only">(
    (publicConfig.bankIdentifierType as "both" | "account_only" | "iban_only") || SITE.bankIdentifierType
  );
  const [editBankAccountNumber, setEditBankAccountNumber] = useState(publicConfig.bankAccountNumber || SITE.bankAccountNumber);
  const [editBankIban, setEditBankIban] = useState(publicConfig.bankIban || SITE.bankIban);
  const [editEasypaisaNumber, setEditEasypaisaNumber] = useState(publicConfig.easypaisaNumber || SITE.easypaisaNumber);
  const [editEasypaisaTitle, setEditEasypaisaTitle] = useState(publicConfig.easypaisaTitle || SITE.easypaisaTitle);
  const [editJazzcashNumber, setEditJazzcashNumber] = useState(publicConfig.jazzcashNumber || SITE.jazzcashNumber);
  const [editJazzcashTitle, setEditJazzcashTitle] = useState(publicConfig.jazzcashTitle || SITE.jazzcashTitle);
  const [editWalletProviders, setEditWalletProviders] = useState<string[]>(
    (publicConfig.walletProviders || SITE.walletProviders)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
  const [editWalletAccountNumber, setEditWalletAccountNumber] = useState(
    publicConfig.walletAccountNumber || publicConfig.easypaisaNumber || SITE.walletAccountNumber
  );
  const [editWalletAccountTitle, setEditWalletAccountTitle] = useState(
    publicConfig.walletAccountTitle || publicConfig.easypaisaTitle || SITE.walletAccountTitle
  );
  const [editWallet2Providers, setEditWallet2Providers] = useState<string[]>(
    (publicConfig.wallet2Providers || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
  const [editWallet2AccountNumber, setEditWallet2AccountNumber] = useState(
    publicConfig.wallet2AccountNumber || ""
  );
  const [editWallet2AccountTitle, setEditWallet2AccountTitle] = useState(
    publicConfig.wallet2AccountTitle || ""
  );
  const [showSecondaryWallet, setShowSecondaryWallet] = useState(
    Boolean(publicConfig.wallet2AccountNumber)
  );
  const [editPaymentDisplayMode, setEditPaymentDisplayMode] = useState<"both" | "wallet_only" | "bank_only">(
    (publicConfig.paymentDisplayMode as "both" | "wallet_only" | "bank_only") || SITE.paymentDisplayMode
  );
  const [editFacebookUrl, setEditFacebookUrl] = useState(publicConfig.facebookUrl || SITE.facebookUrl);
  const [editInstagramUrl, setEditInstagramUrl] = useState(publicConfig.instagramUrl || SITE.instagramUrl);
  const [editLinkedinUrl, setEditLinkedinUrl] = useState(publicConfig.linkedinUrl || SITE.linkedinUrl);
  const [editWhatsappNumber, setEditWhatsappNumber] = useState(
    publicConfig.whatsappNumber || publicConfig.donationPhone || SITE.whatsappNumber
  );
  const [editPaymentInstructions, setEditPaymentInstructions] = useState(publicConfig.paymentInstructions || SITE.paymentInstructions);
  const [savingConfig, setSavingConfig] = useState(false);

  // Admin Credentials State
  const [credEmail, setCredEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingCredentials, setSavingCredentials] = useState(false);

  // Synchronize with public configuration query when available
  useEffect(() => {
    if (publicConfig) {
      setConfig((prev) => ({
        ...prev,
        ...publicConfig,
      }));
      setEditConfigName(publicConfig.name);
      setEditConfigSupporting(publicConfig.supporting);
      setEditConfigPhone(publicConfig.donationPhone);
      setEditConfigEmail(publicConfig.contactEmail);
      setEditConfigGoal(String(publicConfig.goal));
      setEditBankName(publicConfig.bankName || SITE.bankName);
      setEditBankAccountTitle(publicConfig.bankAccountTitle || SITE.bankAccountTitle);
      setEditBankIdentifierType(
        (publicConfig.bankIdentifierType as "both" | "account_only" | "iban_only") || SITE.bankIdentifierType
      );
      setEditBankAccountNumber(publicConfig.bankAccountNumber || SITE.bankAccountNumber);
      setEditBankIban(publicConfig.bankIban || SITE.bankIban);
      setEditEasypaisaNumber(publicConfig.easypaisaNumber || SITE.easypaisaNumber);
      setEditEasypaisaTitle(publicConfig.easypaisaTitle || SITE.easypaisaTitle);
      setEditJazzcashNumber(publicConfig.jazzcashNumber || SITE.jazzcashNumber);
      setEditJazzcashTitle(publicConfig.jazzcashTitle || SITE.jazzcashTitle);
      const provs = (publicConfig.walletProviders || SITE.walletProviders)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      setEditWalletProviders(provs);
      setEditWalletAccountNumber(
        publicConfig.walletAccountNumber || publicConfig.easypaisaNumber || SITE.walletAccountNumber
      );
      setEditWalletAccountTitle(
        publicConfig.walletAccountTitle || publicConfig.easypaisaTitle || SITE.walletAccountTitle
      );
      const secProvs = (publicConfig.wallet2Providers || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      setEditWallet2Providers(secProvs);
      setEditWallet2AccountNumber(publicConfig.wallet2AccountNumber || "");
      setEditWallet2AccountTitle(publicConfig.wallet2AccountTitle || "");
      if (publicConfig.wallet2AccountNumber) {
        setShowSecondaryWallet(true);
      }
      setEditPaymentDisplayMode(
        (publicConfig.paymentDisplayMode as "both" | "wallet_only" | "bank_only") || SITE.paymentDisplayMode
      );
      setEditFacebookUrl(publicConfig.facebookUrl || SITE.facebookUrl);
      setEditInstagramUrl(publicConfig.instagramUrl || SITE.instagramUrl);
      setEditLinkedinUrl(publicConfig.linkedinUrl || SITE.linkedinUrl);
      setEditWhatsappNumber(publicConfig.whatsappNumber || publicConfig.donationPhone || SITE.whatsappNumber);
      setEditPaymentInstructions(publicConfig.paymentInstructions || SITE.paymentInstructions);
    }
  }, [
    publicConfig.name,
    publicConfig.supporting,
    publicConfig.donationPhone,
    publicConfig.contactEmail,
    publicConfig.goal,
    publicConfig.bankName,
    publicConfig.bankAccountTitle,
    publicConfig.bankIdentifierType,
    publicConfig.bankAccountNumber,
    publicConfig.bankIban,
    publicConfig.easypaisaNumber,
    publicConfig.easypaisaTitle,
    publicConfig.jazzcashNumber,
    publicConfig.jazzcashTitle,
    publicConfig.walletProviders,
    publicConfig.walletAccountNumber,
    publicConfig.walletAccountTitle,
    publicConfig.wallet2Providers,
    publicConfig.wallet2AccountNumber,
    publicConfig.wallet2AccountTitle,
    publicConfig.paymentDisplayMode,
    publicConfig.facebookUrl,
    publicConfig.instagramUrl,
    publicConfig.linkedinUrl,
    publicConfig.whatsappNumber,
    publicConfig.whatsappUrl,
    publicConfig.paymentInstructions,
  ]);

  // Navigation State
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"all" | "identity" | "contacts" | "payment" | "wallets" | "instructions" | "security">("all");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [donorTypeFilter, setDonorTypeFilter] = useState<string>("all");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Dashboard Data state
  const [contributions, setContributions] = useState<ContributionItem[]>([]);
  const [requests, setRequests] = useState<DonationRequestItem[]>([]);

  // Receipt Preview Lightbox Modal State
  const [viewReceiptModal, setViewReceiptModal] = useState<{
    url: string;
    donor: string;
    amount?: number | null;
    date?: string;
  } | null>(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    description: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: "destructive" | "warning" | "primary" | "default";
    icon?: "danger" | "warning" | "success" | "logout" | "info";
    loading?: boolean;
    onConfirm: () => Promise<void> | void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Add Contribution Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [donorLabel, setDonorLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("General fund");
  const [receivedOn, setReceivedOn] = useState(new Date().toISOString().slice(0, 10));
  const [manualReceiptPreview, setManualReceiptPreview] = useState<string | null>(null);
  const [manualReceiptUploading, setManualReceiptUploading] = useState(false);

  useEffect(() => {
    const savedToken = sessionStorage.getItem("jjt_admin_token");
    const savedEmail = sessionStorage.getItem("jjt_admin_email");
    if (savedToken) {
      setToken(savedToken);
      if (savedEmail) setAdminEmail(savedEmail);
      loadDashboard(savedToken);
    }
  }, []);

  async function loadDashboard(authToken: string) {
    setDataLoading(true);
    try {
      const res = await getAdminData({ data: authToken });
      setContributions(res.contributions);
      setRequests(res.donationRequests);
      if (res.campaignConfig) {
        setConfig(res.campaignConfig);
        setEditConfigName(res.campaignConfig.name);
        setEditConfigSupporting(res.campaignConfig.supporting);
        setEditConfigPhone(res.campaignConfig.donationPhone);
        setEditConfigEmail(res.campaignConfig.contactEmail);
        setEditConfigGoal(String(res.campaignConfig.goal));
        setEditBankName(res.campaignConfig.bankName || SITE.bankName);
        setEditBankAccountTitle(res.campaignConfig.bankAccountTitle || SITE.bankAccountTitle);
        setEditBankIdentifierType(
          (res.campaignConfig.bankIdentifierType as "both" | "account_only" | "iban_only") || SITE.bankIdentifierType
        );
        setEditBankAccountNumber(res.campaignConfig.bankAccountNumber || SITE.bankAccountNumber);
        setEditBankIban(res.campaignConfig.bankIban || SITE.bankIban);
        setEditEasypaisaNumber(res.campaignConfig.easypaisaNumber || SITE.easypaisaNumber);
        setEditEasypaisaTitle(res.campaignConfig.easypaisaTitle || SITE.easypaisaTitle);
        setEditJazzcashNumber(res.campaignConfig.jazzcashNumber || SITE.jazzcashNumber);
        setEditJazzcashTitle(res.campaignConfig.jazzcashTitle || SITE.jazzcashTitle);
        const provs = (res.campaignConfig.walletProviders || SITE.walletProviders)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        setEditWalletProviders(provs);
        setEditWalletAccountNumber(
          res.campaignConfig.walletAccountNumber || res.campaignConfig.easypaisaNumber || SITE.walletAccountNumber
        );
        setEditWalletAccountTitle(
          res.campaignConfig.walletAccountTitle || res.campaignConfig.easypaisaTitle || SITE.walletAccountTitle
        );
        const secProvs = (res.campaignConfig.wallet2Providers || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        setEditWallet2Providers(secProvs);
        setEditWallet2AccountNumber(res.campaignConfig.wallet2AccountNumber || "");
        setEditWallet2AccountTitle(res.campaignConfig.wallet2AccountTitle || "");
        if (res.campaignConfig.wallet2AccountNumber) {
          setShowSecondaryWallet(true);
        }
        setEditPaymentDisplayMode(
          (res.campaignConfig.paymentDisplayMode as "both" | "wallet_only" | "bank_only") || SITE.paymentDisplayMode
        );
        setEditFacebookUrl(res.campaignConfig.facebookUrl || SITE.facebookUrl);
        setEditInstagramUrl(res.campaignConfig.instagramUrl || SITE.instagramUrl);
        setEditLinkedinUrl(res.campaignConfig.linkedinUrl || SITE.linkedinUrl);
        setEditWhatsappNumber(
          res.campaignConfig.whatsappNumber || res.campaignConfig.donationPhone || SITE.whatsappNumber
        );
        setEditPaymentInstructions(res.campaignConfig.paymentInstructions || SITE.paymentInstructions);
      }
      if (res.adminEmail) {
        setAdminEmail(res.adminEmail);
        setCredEmail(res.adminEmail);
      }
      setIsUnlocked(true);
    } catch {
      setIsUnlocked(false);
      sessionStorage.removeItem("jjt_admin_token");
      sessionStorage.removeItem("jjt_admin_email");
      toast.error("Session expired. Please sign in again.");
    } finally {
      setDataLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await adminLogin({
        data: {
          email: email.trim(),
          password: password.trim(),
        },
      });

      sessionStorage.setItem("jjt_admin_token", res.token);
      sessionStorage.setItem("jjt_admin_email", res.email);
      setToken(res.token);
      setAdminEmail(res.email);
      await loadDashboard(res.token);
      toast.success("Welcome back! Admin portal unlocked");
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("jjt_admin_token");
    sessionStorage.removeItem("jjt_admin_email");
    setToken("");
    setAdminEmail("");
    setIsUnlocked(false);
    toast.info("Logged out successfully");
  }

  async function handleAddContribution(e: React.FormEvent) {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    let receiptUrl: string | undefined = undefined;
    if (manualReceiptPreview) {
      setManualReceiptUploading(true);
      try {
        const uploadRes = await uploadPaymentScreenshot({
          data: {
            fileBase64: manualReceiptPreview,
            fileName: `manual_receipt_${Date.now()}`,
          },
        });
        receiptUrl = uploadRes.url;
      } catch (err) {
        console.warn("Could not upload manual receipt to CDN:", err);
      } finally {
        setManualReceiptUploading(false);
      }
    }

    try {
      await addContributionAdmin({
        data: {
          token,
          donor_label: donorLabel.trim() || "Anonymous",
          amount: numAmount,
          purpose: purpose.trim() || "General fund",
          received_on: receivedOn,
          payment_proof_url: receiptUrl,
        },
      });
      toast.success("Contribution recorded to public ledger");
      setShowAddModal(false);
      setDonorLabel("");
      setAmount("");
      setPurpose("General fund");
      setManualReceiptPreview(null);
      await loadDashboard(token);
    } catch {
      toast.error("Failed to add contribution");
    }
  }

  function promptDeleteContribution(c: ContributionItem) {
    setConfirmModal({
      open: true,
      title: "Remove Contribution Record?",
      description: (
        <span>
          Are you sure you want to permanently remove <strong className="text-foreground">{c.donor_label}</strong>'s contribution of{" "}
          <strong className="text-primary font-semibold">{formatRs(c.amount)}</strong> from the public ledger? This will subtract it from the total funds raised.
        </span>
      ),
      confirmText: "Yes, Remove Entry",
      cancelText: "Keep Contribution",
      variant: "destructive",
      icon: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await deleteContributionAdmin({ data: { token, id: c.id } });
          toast.success(`Removed contribution for ${c.donor_label}`);
          setContributions((prev) => prev.filter((item) => item.id !== c.id));
          setConfirmModal((prev) => ({ ...prev, open: false, loading: false }));
        } catch {
          toast.error("Failed to delete contribution");
          setConfirmModal((prev) => ({ ...prev, loading: false }));
        }
      },
    });
  }

  function promptDismissRequest(r: DonationRequestItem) {
    setConfirmModal({
      open: true,
      title: "Dismiss Donation Inquiry?",
      description: (
        <span>
          Are you sure you want to dismiss the inquiry from <strong className="text-foreground">{r.full_name}</strong> ({r.email})?
          {r.intended_amount ? (
            <span> Intended pledge was <strong className="text-foreground">{formatRs(r.intended_amount)}</strong>.</span>
          ) : null}
        </span>
      ),
      confirmText: "Yes, Dismiss Inquiry",
      cancelText: "Keep Inquiry",
      variant: "destructive",
      icon: "warning",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await deleteDonationRequestAdmin({ data: { token, id: r.id } });
          toast.success(`Dismissed inquiry from ${r.full_name}`);
          setRequests((prev) => prev.filter((item) => item.id !== r.id));
          setConfirmModal((prev) => ({ ...prev, open: false, loading: false }));
        } catch {
          toast.error("Failed to dismiss inquiry");
          setConfirmModal((prev) => ({ ...prev, loading: false }));
        }
      },
    });
  }

  function promptConfirmPledge(req: DonationRequestItem) {
    const confirmAmount = req.intended_amount && req.intended_amount > 0 ? req.intended_amount : 20000;
    setConfirmModal({
      open: true,
      title: "Publish Contribution to Ledger?",
      description: (
        <span>
          This will immediately post a verified contribution of <strong className="text-primary font-semibold">{formatRs(confirmAmount)}</strong> for{" "}
          <strong className="text-foreground">{req.full_name}</strong> onto the public /progress tracker.
          {req.payment_proof_url && (
            <span className="block mt-2 font-medium text-emerald-600 dark:text-emerald-400 text-xs">
              ✓ Attached payment receipt will be permanently linked to this record.
            </span>
          )}
        </span>
      ),
      confirmText: "Publish to Public Ledger",
      cancelText: "Cancel",
      variant: "primary",
      icon: "success",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await addContributionAdmin({
            data: {
              token,
              donor_label: req.full_name,
              amount: confirmAmount,
              purpose: req.message ? `Pledge: ${req.message.slice(0, 50)}` : "Direct Community Pledge",
              received_on: new Date().toISOString().slice(0, 10),
              payment_proof_url: req.payment_proof_url || undefined,
            },
          });
          toast.success(`Confirmed ${formatRs(confirmAmount)} for ${req.full_name}`);
          setConfirmModal((prev) => ({ ...prev, open: false, loading: false }));
          await loadDashboard(token);
        } catch {
          toast.error("Failed to confirm contribution");
          setConfirmModal((prev) => ({ ...prev, loading: false }));
        }
      },
    });
  }

  function promptLogout() {
    setConfirmModal({
      open: true,
      title: "Sign Out of Admin Portal?",
      description: "Are you sure you want to end your current session? You will need your administrative credentials to sign back in.",
      confirmText: "Yes, Sign Out",
      cancelText: "Stay Signed In",
      variant: "destructive",
      icon: "logout",
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, open: false }));
        handleLogout();
      },
    });
  }

  async function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault();
    if (!editConfigName.trim()) {
      toast.error("Campaign name cannot be empty");
      return;
    }
    const numGoal = Number(editConfigGoal);
    if (!numGoal || isNaN(numGoal) || numGoal <= 0) {
      toast.error("Please enter a valid goal amount greater than 0");
      return;
    }
    if (!editConfigEmail.trim() || !editConfigEmail.includes("@")) {
      toast.error("Please enter a valid contact email");
      return;
    }

    setSavingConfig(true);
    try {
      const provsStr = editWalletProviders.join(", ");
      const secProvsStr = editWallet2Providers.join(", ");
      const res = await updateCampaignConfigAdmin({
        data: {
          token,
          name: editConfigName.trim(),
          supporting: editConfigSupporting.trim(),
          donation_phone: editConfigPhone.trim(),
          contact_email: editConfigEmail.trim(),
          goal: Math.round(numGoal),
          bank_name: editBankName.trim(),
          bank_account_title: editBankAccountTitle.trim(),
          bank_identifier_type: editBankIdentifierType,
          bank_account_number: editBankAccountNumber.trim(),
          bank_iban: editBankIban.trim(),
          easypaisa_number: editWalletAccountNumber.trim() || editEasypaisaNumber.trim(),
          easypaisa_title: editWalletAccountTitle.trim() || editEasypaisaTitle.trim(),
          jazzcash_number: editWalletAccountNumber.trim() || editJazzcashNumber.trim(),
          jazzcash_title: editWalletAccountTitle.trim() || editJazzcashTitle.trim(),
          wallet_providers: provsStr || SITE.walletProviders,
          wallet_account_number: editWalletAccountNumber.trim(),
          wallet_account_title: editWalletAccountTitle.trim(),
          wallet2_providers: showSecondaryWallet ? secProvsStr : "",
          wallet2_account_number: showSecondaryWallet ? editWallet2AccountNumber.trim() : "",
          wallet2_account_title: showSecondaryWallet ? editWallet2AccountTitle.trim() : "",
          payment_display_mode: editPaymentDisplayMode,
          facebook_url: editFacebookUrl.trim(),
          instagram_url: editInstagramUrl.trim(),
          linkedin_url: editLinkedinUrl.trim(),
          whatsapp_number: editWhatsappNumber.trim(),
          whatsapp_url: formatWhatsAppUrl(editWhatsappNumber.trim()),
          payment_instructions: editPaymentInstructions.trim(),
        },
      });

      if (res.success && res.config) {
        setConfig({
          ...res.config,
          updatedAt: new Date().toISOString(),
        });
        queryClient.invalidateQueries({ queryKey: ["campaign-config"] });
        toast.success("Campaign configuration saved successfully!");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to update campaign configuration");
    } finally {
      setSavingConfig(false);
    }
  }

  function handleResetConfig() {
    setEditConfigName(config.name);
    setEditConfigSupporting(config.supporting);
    setEditConfigPhone(config.donationPhone);
    setEditConfigEmail(config.contactEmail);
    setEditConfigGoal(String(config.goal));
    setEditBankName(config.bankName || SITE.bankName);
    setEditBankAccountTitle(config.bankAccountTitle || SITE.bankAccountTitle);
    setEditBankIdentifierType(
      (config.bankIdentifierType as "both" | "account_only" | "iban_only") || SITE.bankIdentifierType
    );
    setEditBankAccountNumber(config.bankAccountNumber || SITE.bankAccountNumber);
    setEditBankIban(config.bankIban || SITE.bankIban);
    setEditEasypaisaNumber(config.easypaisaNumber || SITE.easypaisaNumber);
    setEditEasypaisaTitle(config.easypaisaTitle || SITE.easypaisaTitle);
    setEditJazzcashNumber(config.jazzcashNumber || SITE.jazzcashNumber);
    setEditJazzcashTitle(config.jazzcashTitle || SITE.jazzcashTitle);
    const provs = (config.walletProviders || SITE.walletProviders)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setEditWalletProviders(provs);
    setEditWalletAccountNumber(config.walletAccountNumber || config.easypaisaNumber || SITE.walletAccountNumber);
    setEditWalletAccountTitle(config.walletAccountTitle || config.easypaisaTitle || SITE.walletAccountTitle);
    const secProvs = (config.wallet2Providers || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setEditWallet2Providers(secProvs);
    setEditWallet2AccountNumber(config.wallet2AccountNumber || "");
    setEditWallet2AccountTitle(config.wallet2AccountTitle || "");
    setShowSecondaryWallet(Boolean(config.wallet2AccountNumber));
    setEditPaymentDisplayMode(
      (config.paymentDisplayMode as "both" | "wallet_only" | "bank_only") || SITE.paymentDisplayMode
    );
    setEditFacebookUrl(config.facebookUrl || SITE.facebookUrl);
    setEditInstagramUrl(config.instagramUrl || SITE.instagramUrl);
    setEditLinkedinUrl(config.linkedinUrl || SITE.linkedinUrl);
    setEditWhatsappNumber(config.whatsappNumber || config.donationPhone || SITE.whatsappNumber);
    setEditPaymentInstructions(config.paymentInstructions || SITE.paymentInstructions);
    toast.info("Form reset to currently saved configuration.");
  }

  function handlePromptUpdateCredentials(e: React.FormEvent) {
    e.preventDefault();
    const cleanNewEmail = credEmail.trim().toLowerCase();
    if (!cleanNewEmail || !cleanNewEmail.includes("@")) {
      toast.error("Please enter a valid admin email address");
      return;
    }
    if (!currentPassword.trim()) {
      toast.error("Current password is required to verify changes");
      return;
    }
    if (newPassword) {
      if (newPassword.length < 6) {
        toast.error("New password must be at least 6 characters long");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("New password and confirm password do not match");
        return;
      }
    }

    setConfirmModal({
      open: true,
      title: "Update Admin Credentials?",
      description: (
        <span>
          You are changing the admin login email to{" "}
          <strong className="text-foreground">{cleanNewEmail}</strong>.
          {newPassword ? <span> Your administrator portal password will also be updated.</span> : null}
        </span>
      ),
      confirmText: "Yes, Update Credentials",
      cancelText: "Cancel",
      variant: "warning",
      icon: "warning",
      onConfirm: async () => {
        setSavingCredentials(true);
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          const res = await updateAdminCredentials({
            data: {
              token,
              new_email: cleanNewEmail,
              current_password: currentPassword.trim(),
              new_password: newPassword.trim() || undefined,
            },
          });

          if (res.success) {
            setToken(res.token);
            setAdminEmail(res.email);
            setCredEmail(res.email);
            sessionStorage.setItem("jjt_admin_token", res.token);
            sessionStorage.setItem("jjt_admin_email", res.email);

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setConfirmModal((prev) => ({ ...prev, open: false, loading: false }));
            toast.success("Admin email and password updated successfully!");
          }
        } catch (err: any) {
          console.error(err);
          toast.error(err?.message || "Failed to update admin credentials. Check your current password.");
          setConfirmModal((prev) => ({ ...prev, loading: false }));
        } finally {
          setSavingCredentials(false);
        }
      },
    });
  }

  const totalRaised = contributions.reduce((s, c) => s + c.amount, 0);
  const activeGoal = config.goal || SITE.goal;
  const percentGoal = Math.min(100, Math.round((totalRaised / activeGoal) * 100));

  // Filtered Lists
  const filteredContributions = contributions.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.donor_label.toLowerCase().includes(q) ||
      (c.purpose && c.purpose.toLowerCase().includes(q))
    );
  });

  const filteredRequests = requests.filter((r) => {
    const matchesType = donorTypeFilter === "all" || r.donor_type === donorTypeFilter;
    if (!matchesType) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.full_name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.organization && r.organization.toLowerCase().includes(q)) ||
      (r.message && r.message.toLowerCase().includes(q))
    );
  });

  /* -------------------------------------------------------------------------- */
  /* LOGIN PAGE (No Navbar, No Footer, Split-screen with photo on left)         */
  /* -------------------------------------------------------------------------- */
  if (!isUnlocked) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        {/* Left Side: Brand Imagery & Mission Statement */}
        <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-deep p-12 text-deep-foreground lg:flex">
          <img
            src="/classroom-background.png"
            alt="Children in classroom"
            className="absolute inset-0 h-full w-full object-cover opacity-35 filter brightness-75 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/80 to-deep/40" />

          {/* Top Brand Tag */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary">
              <ShieldCheck className="h-4 w-4" /> JJT × SZABIST Community Portal
            </div>
          </div>

          {/* Middle Quote */}
          <div className="relative z-10 max-w-lg">
            <p className="font-serif text-3xl font-semibold leading-snug md:text-4xl text-deep-foreground">
              “Education is the single greatest equalizer for every child in Pakistan.”
            </p>
            <p className="mt-4 text-base text-deep-foreground/80 leading-relaxed">
              Serving orphans, child labourers, and street children since 2014 under the Trust Act 1882 with 100% free quality education.
            </p>
          </div>

          {/* Bottom Trust Credentials */}
          <div className="relative z-10 flex items-center gap-6 border-t border-deep-foreground/15 pt-6 text-xs text-deep-foreground/70">
            <span>Trust Act 1882 Registered</span>
            <span>•</span>
            <span>FBR Tax Exempt</span>
            <span>•</span>
            <span>Islamabad, Pakistan</span>
          </div>
        </div>

        {/* Right Side: Professional Login Form */}
        <div className="flex w-full flex-col justify-between p-5 sm:p-10 lg:w-1/2 lg:p-16">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              ← Back to public website
            </Link>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary lg:hidden">
              Admin Portal
            </span>
          </div>

          <div className="mx-auto w-full max-w-md py-6 sm:py-8">
            <div className="mb-6 sm:mb-8 text-center sm:text-left">
              <img
                src="/logo.png"
                alt="Junior Jinnah Trust Logo"
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover border-2 border-primary/60 shadow-md mx-auto sm:mx-0"
              />
              <h1 className="mt-4 font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                Staff & Admin Sign In
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Sign in with your authorized email and password to manage community contributions and donor pledges.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@jjtrust.org"
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 pl-10 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                  <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                  <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-muted-foreground hover:text-foreground"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-2.5 font-medium flex items-center justify-center gap-2"
              >
                {loading ? "Authenticating…" : "Sign In to Portal"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          </div>

          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {config.name || SITE.name}. All rights reserved.
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* REDESIGNED ADMIN PORTAL WITH SIDEBAR LAYOUT                                 */
  /* -------------------------------------------------------------------------- */
  const navItems = [
    { id: "dashboard" as const, label: "Overview", icon: LayoutDashboard },
    {
      id: "contributions" as const,
      label: "Contributions",
      icon: Receipt,
      badge: contributions.length,
    },
    {
      id: "requests" as const,
      label: "Inquiries & Pledges",
      icon: MessageSquare,
      badge: requests.length,
    },
    { id: "settings" as const, label: "Campaign Info", icon: Settings },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* -------------------- SIDEBAR (Desktop & Mobile Drawer) -------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="JJT Logo"
              className="h-9 w-9 shrink-0 rounded-full object-cover border border-primary/40 shadow-xs"
            />
            <div>
              <span className="block font-serif text-sm font-bold leading-tight text-foreground">
                JJT × SZABIST
              </span>
              <span className="block text-[11px] font-medium text-muted-foreground">
                Campaign Admin
              </span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Management
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 mb-2 px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Quick Links
          </div>
          <nav className="space-y-1">
            <Link
              to="/"
              target="_blank"
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <div className="flex items-center gap-3">
                <ExternalLink className="h-4 w-4" />
                <span>Live Website</span>
              </div>
            </Link>
            <a
              href="https://jjtrust.org/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4" />
                <span>JJT Official Site</span>
              </div>
            </a>
          </nav>
        </div>

        {/* Sidebar Footer: User Profile & Logout */}
        <div className="border-t p-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">
                {(adminEmail[0] || "A").toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-foreground">
                  {adminEmail || "Administrator"}
                </p>
                <p className="text-[11px] text-muted-foreground">Admin Access</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={promptLogout}
              className="shrink-0 text-destructive hover:bg-destructive/10"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* -------------------- MAIN WORKSPACE AREA -------------------- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 shrink-0"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm truncate">
              <span className="text-muted-foreground hidden sm:inline">Admin</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground hidden sm:inline" />
              <span className="font-semibold capitalize text-foreground truncate">
                {activeView === "dashboard" ? "Overview" : activeView}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadDashboard(token)}
              disabled={dataLoading}
              className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm flex items-center gap-1.5"
              title="Refresh Data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${dataLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Record Contribution</span>
              <span className="sm:hidden">Record</span>
            </Button>
          </div>
        </header>

        {/* View Content (Scrollable Container) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-muted/15">
          {/* ---------------- VIEW 1: DASHBOARD OVERVIEW ---------------- */}
          {activeView === "dashboard" && (
            <div className="space-y-6 sm:space-y-8">
              {/* Welcome Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-deep to-deep-2 p-5 sm:p-8 text-deep-foreground shadow-sm">
                <div>
                  <h1 className="font-serif text-xl sm:text-2xl font-bold md:text-3xl leading-snug">
                    Campaign Performance Dashboard
                  </h1>
                  <p className="mt-1.5 sm:mt-2 max-w-xl text-xs sm:text-sm text-deep-foreground/80 leading-relaxed">
                    Live overview for the Classrooms for Every Child initiative supporting Junior Jinnah Trust.
                  </p>
                </div>
                <div className="w-full sm:w-auto rounded-xl bg-card/10 backdrop-blur-md px-4 sm:px-5 py-2.5 sm:py-3 border border-deep-foreground/10 text-left sm:text-right shrink-0">
                  <p className="text-[11px] sm:text-xs uppercase font-medium text-primary">Goal Target</p>
                  <p className="font-serif text-xl sm:text-2xl font-bold">{formatRs(activeGoal)}</p>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card p-5 shadow-xs transition hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Total Raised
                    </p>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Coins className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-3 font-serif text-3xl font-bold text-foreground">
                    {formatRs(totalRaised)}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${percentGoal}%` }}
                      />
                    </div>
                    <span className="font-semibold text-primary">{percentGoal}%</span>
                  </div>
                </div>

                <div className="rounded-xl border bg-card p-5 shadow-xs transition hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Confirmed Donors
                    </p>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-3 font-serif text-3xl font-bold text-foreground">
                    {contributions.length}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">Publicly recorded supporters</p>
                </div>

                <div className="rounded-xl border bg-card p-5 shadow-xs transition hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Pledges & Inquiries
                    </p>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-3 font-serif text-3xl font-bold text-foreground">
                    {requests.length}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">Incoming messages from /contact & /donate</p>
                </div>

                <div className="rounded-xl border bg-card p-5 shadow-xs transition hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Remaining to Goal
                    </p>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Target className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-3 font-serif text-3xl font-bold text-foreground">
                    {formatRs(Math.max(0, activeGoal - totalRaised))}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">To reach {formatRs(activeGoal)}</p>
                </div>
              </div>

              {/* Split Feed: Recent Contributions + Recent Pledges */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Contributions */}
                <div className="rounded-xl border bg-card p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h2 className="font-semibold text-foreground">Recent Contributions</h2>
                      <p className="text-xs text-muted-foreground">Latest donations on public record</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveView("contributions")}
                      className="text-xs text-primary"
                    >
                      View all ({contributions.length})
                    </Button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {contributions.slice(0, 4).map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between rounded-lg border bg-muted/20 p-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{c.donor_label}</p>
                            {c.payment_proof_url && (
                              <button
                                type="button"
                                onClick={() =>
                                  setViewReceiptModal({
                                    url: c.payment_proof_url!,
                                    donor: c.donor_label,
                                    amount: c.amount,
                                    date: c.received_on,
                                  })
                                }
                                className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 hover:bg-emerald-500/20 transition"
                                title="View payment receipt"
                              >
                                <FileCheck className="h-3 w-3" /> Receipt
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{c.purpose || "General fund"}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-serif font-semibold text-foreground">{formatRs(c.amount)}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {new Date(c.received_on).toLocaleDateString("en-PK")}
                          </p>
                        </div>
                      </div>
                    ))}
                    {contributions.length === 0 && (
                      <p className="py-6 text-center text-sm text-muted-foreground">No contributions yet.</p>
                    )}
                  </div>
                </div>

                {/* Recent Pledges */}
                <div className="rounded-xl border bg-card p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h2 className="font-semibold text-foreground">Recent Inquiries & Messages</h2>
                      <p className="text-xs text-muted-foreground">Pending messages from /contact & /donate</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveView("requests")}
                      className="text-xs text-primary"
                    >
                      View all ({requests.length})
                    </Button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {requests.slice(0, 4).map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between rounded-lg border bg-muted/20 p-3"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium text-foreground">{r.full_name}</p>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                                r.donor_type === "contact"
                                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {r.donor_type === "contact" ? "Contact Inquiry" : r.donor_type}
                            </span>
                            {r.payment_proof_url && (
                              <button
                                type="button"
                                onClick={() =>
                                  setViewReceiptModal({
                                    url: r.payment_proof_url!,
                                    donor: r.full_name,
                                    amount: r.intended_amount,
                                    date: r.created_at,
                                  })
                                }
                                className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-500/25 transition"
                                title="View Payment Proof"
                              >
                                <FileCheck className="h-3 w-3" /> Proof
                              </button>
                            )}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">{r.email}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => promptConfirmPledge(r)}
                            className="h-8 text-xs"
                          >
                            <CheckCircle className="mr-1 h-3.5 w-3.5 text-primary" /> Confirm
                          </Button>
                        </div>
                      </div>
                    ))}
                    {requests.length === 0 && (
                      <p className="py-6 text-center text-sm text-muted-foreground">No inquiries yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- VIEW 2: CONTRIBUTIONS LEDGER ---------------- */}
          {activeView === "contributions" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Public Contributions Ledger</h1>
                  <p className="text-sm text-muted-foreground">
                    All donations displayed publicly on the campaign progress page.
                  </p>
                </div>

                <div className="relative w-full max-w-xs sm:w-auto">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by donor or purpose..."
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 pl-9 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                  />
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground sm:hidden px-1">
                <span>Showing {filteredContributions.length} records</span>
                <span>Swipe table horizontally →</span>
              </div>

              <div className="overflow-x-auto rounded-xl border bg-card shadow-xs">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="border-b bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold">Donor / Supporter</th>
                      <th className="p-4 font-semibold">Designated Purpose</th>
                      <th className="p-4 text-right font-semibold">Amount</th>
                      <th className="p-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContributions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-muted-foreground">
                          {searchQuery
                            ? "No matching contributions found."
                            : "No contributions recorded yet."}
                        </td>
                      </tr>
                    ) : (
                      filteredContributions.map((c) => (
                        <tr key={c.id} className="border-t hover:bg-muted/30 transition">
                          <td className="p-4 whitespace-nowrap text-muted-foreground">
                            {new Date(c.received_on).toLocaleDateString("en-PK", {
                              dateStyle: "medium",
                            })}
                          </td>
                          <td className="p-4 font-medium text-foreground">
                            <div className="flex items-center gap-2">
                              <span>{c.donor_label}</span>
                              {c.payment_proof_url && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewReceiptModal({
                                      url: c.payment_proof_url!,
                                      donor: c.donor_label,
                                      amount: c.amount,
                                      date: c.received_on,
                                    })
                                  }
                                  className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/20 transition"
                                  title="View verified payment receipt"
                                >
                                  <FileCheck className="h-3 w-3" /> Receipt
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground">{c.purpose || "General fund"}</td>
                          <td className="p-4 text-right font-serif text-base font-semibold text-foreground">
                            {formatRs(c.amount)}
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => promptDeleteContribution(c)}
                              className="text-destructive hover:bg-destructive/10"
                              title="Delete from public ledger"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------------- VIEW 3: PLEDGES & LEADS ---------------- */}
          {activeView === "requests" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Incoming Inquiries & Pledges</h1>
                  <p className="text-sm text-muted-foreground">
                    Messages and inquiries submitted through the /contact and /donate forms.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={donorTypeFilter}
                    onChange={(e) => setDonorTypeFilter(e.target.value)}
                    className="rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="contact">Contact Inquiries</option>
                    <option value="individual">Individual</option>
                    <option value="company">Company</option>
                    <option value="foundation">Foundation</option>
                  </select>

                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search inquiries..."
                      className="rounded-lg border border-input bg-card px-3 py-2 pl-9 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                    />
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                  <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
                    <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p className="text-base font-medium">No matching inquiries found.</p>
                  </div>
                ) : (
                  filteredRequests.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-xl border bg-card p-4 sm:p-6 shadow-xs transition hover:shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <h3 className="text-base sm:text-lg font-semibold text-foreground">{r.full_name}</h3>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                                r.donor_type === "contact"
                                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {r.donor_type === "contact" ? "Contact Inquiry" : r.donor_type}
                            </span>
                          </div>

                          <div className="mt-2.5 flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <a
                              href={`mailto:${r.email}`}
                              className="inline-flex items-center gap-1.5 hover:text-foreground"
                            >
                              <Mail className="h-4 w-4 text-primary" /> {r.email}
                            </a>
                            {r.phone && (
                              <a
                                href={`tel:${r.phone}`}
                                className="inline-flex items-center gap-1.5 hover:text-foreground"
                              >
                                <Phone className="h-4 w-4 text-primary" /> {r.phone}
                              </a>
                            )}
                            {r.organization && (
                              <span className="inline-flex items-center gap-1.5">
                                <Building className="h-4 w-4" /> {r.organization}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />{" "}
                              {new Date(r.created_at).toLocaleString("en-PK")}
                            </span>
                          </div>

                          {r.intended_amount && (
                            <p className="mt-3 text-sm font-medium text-foreground">
                              Intended Pledge:{" "}
                              <span className="font-serif text-lg font-bold text-primary">
                                {formatRs(r.intended_amount)}
                              </span>
                            </p>
                          )}

                          {r.message && (
                            <div className="mt-3 rounded-lg bg-muted/60 p-3 text-sm italic text-foreground/85">
                              "{r.message}"
                            </div>
                          )}

                          {r.payment_proof_url && (
                            <div className="mt-3.5 flex flex-wrap items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                              <img
                                src={r.payment_proof_url}
                                alt="Payment proof"
                                className="h-14 w-14 rounded-md border object-cover cursor-pointer hover:opacity-85 transition shadow-xs bg-background"
                                onClick={() =>
                                  setViewReceiptModal({
                                    url: r.payment_proof_url!,
                                    donor: r.full_name,
                                    amount: r.intended_amount,
                                    date: r.created_at,
                                  })
                                }
                              />
                              <div className="min-w-0 flex-1">
                                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                  <FileCheck className="h-3.5 w-3.5" /> Payment Receipt Attached
                                </span>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Uploaded via Cloudinary CDN • Verify transaction before confirming
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs shrink-0"
                                onClick={() =>
                                  setViewReceiptModal({
                                    url: r.payment_proof_url!,
                                    donor: r.full_name,
                                    amount: r.intended_amount,
                                    date: r.created_at,
                                  })
                                }
                              >
                                <Eye className="h-3.5 w-3.5" /> Inspect Receipt
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-border/50 justify-end">
                          {r.intended_amount && r.intended_amount > 0 ? (
                            <Button
                              size="sm"
                              onClick={() => promptConfirmPledge(r)}
                              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle className="h-4 w-4" /> Confirm to Ledger
                            </Button>
                          ) : (
                            <a
                              href={`mailto:${r.email}?subject=${encodeURIComponent("Re: Junior Jinnah Trust Inquiry")}`}
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition"
                            >
                              <Mail className="h-3.5 w-3.5" /> Reply by Email
                            </a>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => promptDismissRequest(r)}
                            className="text-destructive hover:bg-destructive/10 shrink-0"
                            title="Dismiss inquiry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ---------------- VIEW 4: CAMPAIGN CONFIGURATION (DYNAMIC & ORGANIZED) ---------------- */}
          {activeView === "settings" && (
            <div className="w-full space-y-6">
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Campaign Info & Configuration</h1>
                  <p className="text-sm text-muted-foreground">
                    Customize branding, fundraising goals, public contacts, payment details, and donor instructions.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live on Website
                  </span>
                  {config.updatedAt && (
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      Updated: {new Date(config.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Organized Sub-Navigation / Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-muted/60 border border-border/80">
                {[
                  { id: "all", label: "All Settings", icon: Layers },
                  { id: "identity", label: "Identity & Goal", icon: Target },
                  { id: "contacts", label: "Contacts & Socials", icon: Share2 },
                  { id: "payment", label: "Bank Account", icon: Building },
                  { id: "wallets", label: "Mobile Wallets", icon: Wallet },
                  { id: "instructions", label: "Donor Instructions", icon: FileCheck },
                  { id: "security", label: "Admin Security", icon: ShieldCheck },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = settingsTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSettingsTab(tab.id as any)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        isActive
                          ? "bg-background text-foreground shadow-xs border border-border"
                          : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {/* Form Column (2 Cols) */}
                <div className="lg:col-span-2 space-y-6">
                  <form onSubmit={handleSaveConfig} className="space-y-6">
                    {/* Quick Top Actions Toolbar */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border bg-card shadow-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-xs font-medium text-foreground">
                          {settingsTab === "all"
                            ? "All Sections Visible"
                            : `Filtering: ${settingsTab.toUpperCase()}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={savingConfig}
                          onClick={handleResetConfig}
                          className="gap-1.5 h-8 text-xs"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Reset
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={savingConfig}
                          className="gap-1.5 h-8 text-xs px-4"
                        >
                          {savingConfig ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-3.5 w-3.5" /> Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    {/* CARD 1: Campaign Identity & Goal */}
                    {(settingsTab === "all" || settingsTab === "identity") && (
                      <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-5 transition">
                        <div className="flex items-start justify-between border-b pb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <Target className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-sm sm:text-base font-bold text-foreground">
                                Campaign Identity & Fundraising Target
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Public branding names, supporting tagline, and overall fundraising target in PKR.
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 shrink-0 hidden sm:inline-block">
                            {formatRs(Number(editConfigGoal) || 0)}
                          </span>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                              Campaign Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={editConfigName}
                              onChange={(e) => setEditConfigName(e.target.value)}
                              placeholder="e.g. JJT × SZABIST Community"
                              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                            <p className="text-[11px] text-muted-foreground">
                              Featured in the website navigation bar, page meta titles, and footer branding.
                            </p>
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                              Beneficiary Trust / Tagline *
                            </label>
                            <input
                              type="text"
                              required
                              value={editConfigSupporting}
                              onChange={(e) => setEditConfigSupporting(e.target.value)}
                              placeholder="e.g. supporting Junior Jinnah Trust"
                              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                            <p className="text-[11px] text-muted-foreground">
                              Appears right under the campaign name in headers and footer badges.
                            </p>
                          </div>

                          <div className="space-y-1.5 sm:col-span-2 pt-2 border-t">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                Fundraising Goal Target (PKR) *
                              </label>
                              <span className="text-xs font-semibold text-primary font-mono">
                                Target: {formatRs(Number(editConfigGoal) || 0)}
                              </span>
                            </div>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                                Rs
                              </span>
                              <input
                                type="number"
                                required
                                min={1000}
                                step={1000}
                                value={editConfigGoal}
                                onChange={(e) => setEditConfigGoal(e.target.value)}
                                placeholder="100000"
                                className="w-full rounded-lg border border-input bg-background pl-10 pr-3 py-2 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Sets the 100% benchmark for the progress ring, goal milestone bar, and remaining funds needed.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CARD 2: Public Contacts & Socials */}
                    {(settingsTab === "all" || settingsTab === "contacts") && (
                      <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-5 transition">
                        <div className="flex items-start justify-between border-b pb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              <Share2 className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-sm sm:text-base font-bold text-foreground">
                                Public Contacts & Social Media Links
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Direct donor inquiry hotline, official email, WhatsApp instant messaging, and social profiles.
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20 shrink-0 hidden sm:inline-block">
                            Direct Contacts
                          </span>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          {/* Hotline Phone */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                              Donation Contact Hotline *
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <input
                                type="text"
                                required
                                value={editConfigPhone}
                                onChange={(e) => setEditConfigPhone(e.target.value)}
                                placeholder="03219519360"
                                className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Primary inquiry number listed on header and contact page.
                            </p>
                          </div>

                          {/* Contact Email */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                              Official Contact Email *
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <input
                                type="email"
                                required
                                value={editConfigEmail}
                                onChange={(e) => setEditConfigEmail(e.target.value)}
                                placeholder="jjtszabist.isb@gmail.com"
                                className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Opens Gmail composer for donor inquiries.
                            </p>
                          </div>

                          {/* WhatsApp Official Number */}
                          <div className="space-y-1.5 sm:col-span-2 pt-2 border-t">
                            <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                WhatsApp Official Mobile Number *
                              </span>
                              <span className="text-[10px] lowercase font-mono text-muted-foreground">
                                Chat Link: {formatWhatsAppUrl(editWhatsappNumber)}
                              </span>
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-emerald-500" />
                              <input
                                type="tel"
                                required
                                value={editWhatsappNumber}
                                onChange={(e) => setEditWhatsappNumber(e.target.value)}
                                placeholder="03219519360"
                                className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Enter standard mobile digits (e.g. <code>03219519360</code>). Chat links (<code>{formatWhatsAppUrl(editWhatsappNumber)}</code>) are generated automatically for header, footer, and contact buttons.
                            </p>
                          </div>

                          {/* Social Links Subgrid */}
                          <div className="sm:col-span-2 pt-2 border-t grid gap-4 sm:grid-cols-3">
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                Facebook Page URL
                              </label>
                              <input
                                type="text"
                                value={editFacebookUrl}
                                onChange={(e) => setEditFacebookUrl(e.target.value)}
                                placeholder="https://www.facebook.com/..."
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                Instagram Profile URL
                              </label>
                              <input
                                type="text"
                                value={editInstagramUrl}
                                onChange={(e) => setEditInstagramUrl(e.target.value)}
                                placeholder="https://www.instagram.com/..."
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                LinkedIn Company URL
                              </label>
                              <input
                                type="text"
                                value={editLinkedinUrl}
                                onChange={(e) => setEditLinkedinUrl(e.target.value)}
                                placeholder="https://www.linkedin.com/..."
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CARD 3: Bank Account Details & Display Mode */}
                    {(settingsTab === "all" || settingsTab === "payment") && (
                      <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-5 transition">
                        <div className="flex items-start justify-between border-b pb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              <Building className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-sm sm:text-base font-bold text-foreground">
                                Bank Account Details & Display Mode
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Official bank deposit credentials, IBAN/Account No format, and frontend display options.
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 shrink-0 hidden sm:inline-block">
                            {editPaymentDisplayMode === "both" ? "Both Accounts" : editPaymentDisplayMode === "wallet_only" ? "Wallet Only" : "Bank Only"}
                          </span>
                        </div>

                        {/* Frontend Display Mode Selector */}
                        <div className="space-y-2.5">
                          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                            Frontend Payment Accounts Display Option *
                          </label>
                          <div className="grid gap-2.5 sm:grid-cols-3">
                            <button
                              type="button"
                              onClick={() => setEditPaymentDisplayMode("both")}
                              className={`rounded-xl border p-3 text-left transition ${
                                editPaymentDisplayMode === "both"
                                  ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-foreground"
                                  : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold">Both Accounts</span>
                                {editPaymentDisplayMode === "both" && (
                                  <span className="text-[10px] font-semibold text-primary bg-primary/20 px-1.5 py-0.5 rounded">Active</span>
                                )}
                              </div>
                              <p className="mt-1 text-[11px] leading-tight opacity-80">
                                Show Bank Transfer & Mobile Wallets side by side.
                              </p>
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditPaymentDisplayMode("wallet_only")}
                              className={`rounded-xl border p-3 text-left transition ${
                                editPaymentDisplayMode === "wallet_only"
                                  ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20 text-foreground"
                                  : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold">Only Mobile Wallet</span>
                                {editPaymentDisplayMode === "wallet_only" && (
                                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">Active</span>
                                )}
                              </div>
                              <p className="mt-1 text-[11px] leading-tight opacity-80">
                                Show only 1 account: Mobile Wallet ({editWalletProviders.slice(0, 2).join(", ") || "Wallets"}).
                              </p>
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditPaymentDisplayMode("bank_only")}
                              className={`rounded-xl border p-3 text-left transition ${
                                editPaymentDisplayMode === "bank_only"
                                  ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20 text-foreground"
                                  : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold">Only Bank Account</span>
                                {editPaymentDisplayMode === "bank_only" && (
                                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded">Active</span>
                                )}
                              </div>
                              <p className="mt-1 text-[11px] leading-tight opacity-80">
                                Show only 1 account: Bank Transfer ({editBankName || "Bank"}).
                              </p>
                            </button>
                          </div>
                        </div>

                        {/* Bank Details Inputs */}
                        <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                              Bank Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={editBankName}
                              onChange={(e) => setEditBankName(e.target.value)}
                              placeholder="e.g. Meezan Bank, HBL, Bank Alfalah"
                              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                              Account Title *
                            </label>
                            <input
                              type="text"
                              required
                              value={editBankAccountTitle}
                              onChange={(e) => setEditBankAccountTitle(e.target.value)}
                              placeholder="e.g. Junior Jinnah Trust"
                              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                          </div>

                          {/* Account Number / IBAN Format Dropdown */}
                          <div className="space-y-1.5 sm:col-span-2 pt-1 border-t">
                            <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center justify-between">
                              <span>Account Identifiers Format (IBAN / Account No / Both) *</span>
                              <span className="text-[10px] text-muted-foreground font-normal lowercase">
                                {editBankIdentifierType === "both" ? "showing both fields" : editBankIdentifierType === "account_only" ? "account number only" : "iban only"}
                              </span>
                            </label>
                            <select
                              value={editBankIdentifierType}
                              onChange={(e) => setEditBankIdentifierType(e.target.value as "both" | "account_only" | "iban_only")}
                              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="both">Both (Account Number & IBAN) – Show Both Fields</option>
                              <option value="account_only">Account Number Only – Show Account Number Field</option>
                              <option value="iban_only">IBAN Only – Show IBAN Field</option>
                            </select>
                            <p className="text-[11px] text-muted-foreground">
                              Select which identifiers donors should see for online banking and Raast transfers.
                            </p>
                          </div>

                          {/* Dynamic Account Number Input */}
                          {(editBankIdentifierType === "both" || editBankIdentifierType === "account_only") && (
                            <div className={`space-y-1.5 ${editBankIdentifierType === "account_only" ? "sm:col-span-2" : ""}`}>
                              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                Account Number *
                              </label>
                              <input
                                type="text"
                                required={editBankIdentifierType === "both" || editBankIdentifierType === "account_only"}
                                value={editBankAccountNumber}
                                onChange={(e) => setEditBankAccountNumber(e.target.value)}
                                placeholder="e.g. 01010101010101"
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                          )}

                          {/* Dynamic IBAN Input */}
                          {(editBankIdentifierType === "both" || editBankIdentifierType === "iban_only") && (
                            <div className={`space-y-1.5 ${editBankIdentifierType === "iban_only" ? "sm:col-span-2" : ""}`}>
                              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                IBAN (International / Raast) *
                              </label>
                              <input
                                type="text"
                                required={editBankIdentifierType === "both" || editBankIdentifierType === "iban_only"}
                                value={editBankIban}
                                onChange={(e) => setEditBankIban(e.target.value)}
                                placeholder="e.g. PK00MEZN0001010101010101"
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* CARD 4: Mobile Wallets Configuration */}
                    {(settingsTab === "all" || settingsTab === "wallets") && (
                      <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-5 transition">
                        <div className="flex items-start justify-between border-b pb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <Wallet className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-sm sm:text-base font-bold text-foreground">
                                Mobile Wallets Configuration
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Multi-provider mobile wallets (EasyPaisa, JazzCash, SadaPay, NayaPay) and optional secondary wallet.
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0 hidden sm:inline-block">
                            {editWalletProviders.length} Selected
                          </span>
                        </div>

                        {/* Primary Mobile Wallet Card */}
                        <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                              Supported Primary Wallet Providers *
                            </label>

                            {/* Interactive multi-select pills */}
                            <div className="flex flex-wrap gap-1.5">
                              {MOBILE_WALLET_OPTIONS.map((opt) => {
                                const isSelected = editWalletProviders.includes(opt);
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) {
                                        setEditWalletProviders(editWalletProviders.filter((p) => p !== opt));
                                      } else {
                                        setEditWalletProviders([...editWalletProviders, opt]);
                                      }
                                    }}
                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                      isSelected
                                        ? "bg-emerald-600 text-white shadow-xs"
                                        : "bg-background border border-input text-muted-foreground hover:text-foreground hover:bg-accent"
                                    }`}
                                  >
                                    {isSelected ? "✓" : "+"} {opt}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Quick Dropdown Selector */}
                            <div className="flex items-center gap-2 pt-1">
                              <select
                                aria-label="Add Wallet Provider"
                                className="text-xs rounded-lg border border-input bg-background px-2.5 py-1.5 text-foreground outline-none focus:border-primary"
                                value=""
                                onChange={(e) => {
                                  const val = e.target.value.trim();
                                  if (val && !editWalletProviders.includes(val)) {
                                    setEditWalletProviders([...editWalletProviders, val]);
                                  }
                                  e.target.value = "";
                                }}
                              >
                                <option value="">+ Add Provider from Dropdown...</option>
                                {MOBILE_WALLET_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt} disabled={editWalletProviders.includes(opt)}>
                                    {opt} {editWalletProviders.includes(opt) ? "(Selected)" : ""}
                                  </option>
                                ))}
                              </select>

                              {editWalletProviders.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setEditWalletProviders([])}
                                  className="text-[11px] text-muted-foreground hover:text-destructive underline"
                                >
                                  Clear selection
                                </button>
                              )}
                            </div>

                            {/* Display active selected providers */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-[11px] text-muted-foreground">Active:</span>
                              {editWalletProviders.length > 0 ? (
                                editWalletProviders.map((prov) => (
                                  <span
                                    key={prov}
                                    className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-300"
                                  >
                                    {prov}
                                    <button
                                      type="button"
                                      onClick={() => setEditWalletProviders(editWalletProviders.filter((p) => p !== prov))}
                                      className="ml-0.5 hover:text-destructive"
                                      title={`Remove ${prov}`}
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))
                              ) : (
                                <span className="text-[11px] text-destructive italic">
                                  Please select at least one provider (e.g. EasyPaisa, JazzCash, SadaPay)
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-muted/50">
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                Account Number (Mobile No) *
                              </label>
                              <input
                                type="text"
                                required
                                value={editWalletAccountNumber}
                                onChange={(e) => setEditWalletAccountNumber(e.target.value)}
                                placeholder="03219519360"
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                              />
                              <p className="text-[11px] text-muted-foreground">
                                Active phone number registered for this wallet.
                              </p>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                Account Title *
                              </label>
                              <input
                                type="text"
                                required
                                value={editWalletAccountTitle}
                                onChange={(e) => setEditWalletAccountTitle(e.target.value)}
                                placeholder="Junior Jinnah Trust"
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                              />
                              <p className="text-[11px] text-muted-foreground">
                                Account title shown during receiver verification.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Secondary Mobile Wallet Account (Optional) */}
                        <div className="rounded-xl border border-dashed bg-card p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <input
                                id="enableSecondaryWallet"
                                type="checkbox"
                                checked={showSecondaryWallet}
                                onChange={(e) => {
                                  setShowSecondaryWallet(e.target.checked);
                                  if (!e.target.checked) {
                                    setEditWallet2AccountNumber("");
                                    setEditWallet2AccountTitle("");
                                    setEditWallet2Providers([]);
                                  }
                                }}
                                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                              />
                              <label htmlFor="enableSecondaryWallet" className="text-xs font-semibold text-foreground cursor-pointer">
                                Add Secondary Mobile Wallet (Optional, e.g. for a 2nd phone number or Raast)
                              </label>
                            </div>
                            {showSecondaryWallet && (
                              <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                Active
                              </span>
                            )}
                          </div>

                          {showSecondaryWallet && (
                            <div className="space-y-4 pt-3 border-t">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                                  Secondary Wallet Providers
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                  {MOBILE_WALLET_OPTIONS.map((opt) => {
                                    const isSelected = editWallet2Providers.includes(opt);
                                    return (
                                      <button
                                        key={`sec-${opt}`}
                                        type="button"
                                        onClick={() => {
                                          if (isSelected) {
                                            setEditWallet2Providers(editWallet2Providers.filter((p) => p !== opt));
                                          } else {
                                            setEditWallet2Providers([...editWallet2Providers, opt]);
                                          }
                                        }}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                                          isSelected
                                            ? "bg-primary text-primary-foreground shadow-xs"
                                            : "bg-background border border-input text-muted-foreground hover:text-foreground"
                                        }`}
                                      >
                                        {isSelected ? "✓" : "+"} {opt}
                                      </button>
                                    );
                                  })}
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                  <select
                                    aria-label="Add Secondary Provider"
                                    className="text-xs rounded-lg border border-input bg-background px-2.5 py-1.5 text-foreground outline-none focus:border-primary"
                                    value=""
                                    onChange={(e) => {
                                      const val = e.target.value.trim();
                                      if (val && !editWallet2Providers.includes(val)) {
                                        setEditWallet2Providers([...editWallet2Providers, val]);
                                      }
                                      e.target.value = "";
                                    }}
                                  >
                                    <option value="">+ Add Provider from Dropdown...</option>
                                    {MOBILE_WALLET_OPTIONS.map((opt) => (
                                      <option key={`sec-opt-${opt}`} value={opt} disabled={editWallet2Providers.includes(opt)}>
                                        {opt} {editWallet2Providers.includes(opt) ? "(Selected)" : ""}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                    Secondary Account Number
                                  </label>
                                  <input
                                    type="text"
                                    value={editWallet2AccountNumber}
                                    onChange={(e) => setEditWallet2AccountNumber(e.target.value)}
                                    placeholder="03001234567"
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                    Secondary Account Title
                                  </label>
                                  <input
                                    type="text"
                                    value={editWallet2AccountTitle}
                                    onChange={(e) => setEditWallet2AccountTitle(e.target.value)}
                                    placeholder="Junior Jinnah Trust"
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* CARD 5: Donor Payment Instructions */}
                    {(settingsTab === "all" || settingsTab === "instructions") && (
                      <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-4 transition">
                        <div className="flex items-start justify-between border-b pb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                              <FileCheck className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-sm sm:text-base font-bold text-foreground">
                                Donor Payment Instructions & Transfer Notes
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Custom helper guidance shown above the receipt screenshot upload area on /donate.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                            Transfer Instructions / Verification Guidance
                          </label>
                          <textarea
                            rows={3}
                            value={editPaymentInstructions}
                            onChange={(e) => setEditPaymentInstructions(e.target.value)}
                            placeholder="Please use your name as the transfer reference and upload your receipt screenshot below."
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                          <p className="text-[11px] text-muted-foreground">
                            Displayed on the donation checkout screen to reassure donors and guide receipt submission.
                          </p>
                        </div>

                        {/* Live Quote Preview */}
                        <div className="rounded-xl border bg-muted/40 p-3.5 space-y-1">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">Preview on Donate Page:</p>
                          <p className="text-xs text-foreground italic">
                            "{editPaymentInstructions || "Please use your name as the transfer reference and upload your receipt screenshot below."}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border bg-card shadow-xs">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">Campaign Settings</span> · Updates are published immediately.
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={savingConfig}
                          onClick={handleResetConfig}
                          className="gap-2"
                        >
                          <RotateCcw className="h-4 w-4" /> Reset
                        </Button>

                        <Button
                          type="submit"
                          size="sm"
                          disabled={savingConfig}
                          className="gap-2 px-5"
                        >
                          {savingConfig ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" /> Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" /> Save Campaign Settings
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Live Public Preview Card (1 Col) */}
                <div className="space-y-5 lg:sticky lg:top-6 self-start">
                  <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Eye className="h-4 w-4 text-primary" /> Live Public Preview
                      </h3>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        Simulated
                      </span>
                    </div>

                    {/* Header Simulation */}
                    <div className="rounded-xl border bg-muted/40 p-3 space-y-1">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground">Header & Brand</p>
                      <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="h-7 w-7 rounded-full object-cover border border-primary" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">
                            {editConfigName || "Campaign Name"}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {editConfigSupporting || "Supporting text"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Target Simulation */}
                    <div className="rounded-xl border bg-muted/40 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase font-semibold text-muted-foreground">Target Goal</p>
                        <p className="font-serif text-sm font-bold text-foreground">
                          {formatRs(Number(editConfigGoal) || 0)}
                        </p>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.round((totalRaised / (Number(editConfigGoal) || 1)) * 100))}%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Raised: {formatRs(totalRaised)}</span>
                        <span>
                          {Math.round((totalRaised / (Number(editConfigGoal) || 1)) * 100)}% of goal
                        </span>
                      </div>
                    </div>

                    {/* Contact Links Simulation */}
                    <div className="rounded-xl border bg-muted/40 p-3 space-y-2 text-xs">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground">Public Contacts & WhatsApp</p>
                      <div className="flex items-center gap-2 text-foreground font-medium truncate">
                        <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{editConfigPhone || "Hotline"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground font-medium truncate">
                        <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{editConfigEmail || "Email"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium truncate">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="truncate text-[11px]">WhatsApp: {editWhatsappNumber || "03219519360"}</span>
                      </div>
                    </div>

                    {/* Bank & Mobile Wallets Simulation */}
                    <div className="rounded-xl border bg-emerald-500/5 border-emerald-500/20 p-3 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <Building className="h-3 w-3" /> Official Payment Details
                        </p>
                        <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-background border text-muted-foreground">
                          {editPaymentDisplayMode === "both"
                            ? "Both Accounts"
                            : editPaymentDisplayMode === "wallet_only"
                            ? "1 Account (Wallet)"
                            : "1 Account (Bank)"}
                        </span>
                      </div>
                      <div className="space-y-1 pt-1 text-[11px]">
                        {editPaymentDisplayMode !== "wallet_only" && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Bank:</span>
                              <span className="font-semibold text-foreground">{editBankName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Title:</span>
                              <span className="font-semibold text-foreground">{editBankAccountTitle}</span>
                            </div>
                            {(editBankIdentifierType === "both" || editBankIdentifierType === "account_only") && (
                              <div className="flex justify-between font-mono">
                                <span className="text-muted-foreground font-sans">A/C:</span>
                                <span className="font-semibold text-foreground">{editBankAccountNumber}</span>
                              </div>
                            )}
                            {(editBankIdentifierType === "both" || editBankIdentifierType === "iban_only") && (
                              <div className="flex justify-between font-mono">
                                <span className="text-muted-foreground font-sans">IBAN:</span>
                                <span className="font-semibold text-foreground truncate max-w-[130px]">{editBankIban}</span>
                              </div>
                            )}
                          </>
                        )}

                        {editPaymentDisplayMode !== "bank_only" && (
                          <>
                            <div className={`flex justify-between font-mono ${editPaymentDisplayMode === "both" ? "pt-1 border-t border-emerald-500/10" : ""}`}>
                              <span className="text-muted-foreground font-sans truncate max-w-[110px]" title={editWalletProviders.join(", ") || "Wallets"}>
                                {editWalletProviders.slice(0, 2).join("/") || "Wallet"}:
                              </span>
                              <span className="font-semibold text-foreground">{editWalletAccountNumber}</span>
                            </div>
                            {editPaymentDisplayMode === "wallet_only" && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Title:</span>
                                <span className="font-semibold text-foreground">{editWalletAccountTitle}</span>
                              </div>
                            )}
                            {showSecondaryWallet && editWallet2AccountNumber ? (
                              <div className="flex justify-between font-mono text-[10px]">
                                <span className="text-muted-foreground font-sans truncate max-w-[110px]">
                                  {editWallet2Providers.slice(0, 2).join("/") || "Wallet 2"}:
                                </span>
                                <span className="font-semibold text-foreground">{editWallet2AccountNumber}</span>
                              </div>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between">
                      <Link
                        to="/donate"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> View Public Donate Page
                      </Link>
                      <span className="text-[10px] text-muted-foreground">Auto-synced</span>
                    </div>

                    <p className="text-[11px] text-muted-foreground italic">
                      Clicking "Save Campaign Settings" will automatically update these values on the live website.
                    </p>
                  </div>
                </div>
              </div>

              {/* ---------------- ADMIN SECURITY & CREDENTIALS SECTION ---------------- */}
              {(settingsTab === "all" || settingsTab === "security") && (
                <div className="rounded-2xl border bg-card p-5 sm:p-7 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-4 mb-6">
                  <div>
                    <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" /> Admin Security & Credentials
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Update your administrator sign-in email address and portal access password.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Encrypted Neon Storage
                  </span>
                </div>

                <form onSubmit={handlePromptUpdateCredentials} className="space-y-5 max-w-3xl">
                  {/* Admin Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Administrator Login Email *
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        required
                        value={credEmail}
                        onChange={(e) => setCredEmail(e.target.value)}
                        placeholder="admin@jjtrust.org"
                        className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      The official email address required to unlock this admin dashboard.
                    </p>
                  </div>

                  {/* Password Change Fields */}
                  <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        New Password (optional)
                      </label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Leave blank to keep unchanged"
                          className="w-full rounded-lg border border-input bg-background pl-9 pr-10 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                          title={showNewPassword ? "Hide password" : "Show password"}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">Minimum 6 characters. Leave blank if not changing.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-type new password"
                          className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      {newPassword && confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-[11px] text-destructive">Passwords do not match.</p>
                      )}
                    </div>
                  </div>

                  {/* Current Password Verification */}
                  <div className="pt-2 border-t space-y-1.5">
                    <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Current Password (Required for confirmation) *
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password to authorize changes"
                        className="w-full rounded-lg border border-input bg-background pl-9 pr-10 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                        title={showCurrentPassword ? "Hide password" : "Show password"}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      For your protection, enter your existing password before updates are committed.
                    </p>
                  </div>

                  {/* Action Toolbar */}
                  <div className="pt-4 border-t flex items-center justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={savingCredentials}
                      className="gap-2 px-5"
                    >
                      {savingCredentials ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" /> Updating Credentials...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" /> Update Admin Credentials
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
        </main>
      </div>

      {/* ---------------- RECORD CONTRIBUTION MODAL ---------------- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border bg-card p-5 sm:p-6 shadow-2xl animate-rise max-h-[92vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-foreground">Record Confirmed Contribution</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This will add a new entry to the public record on the /progress page.
            </p>

            <form onSubmit={handleAddContribution} className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Donor Name / Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SZABIST Alumni or Anonymous"
                  value={donorLabel}
                  onChange={(e) => setDonorLabel(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Amount (PKR) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="e.g. 25000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Purpose / Category</label>
                <input
                  type="text"
                  placeholder="e.g. Essential learning supplies, School meals, etc."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Date Received</label>
                <input
                  type="date"
                  required
                  value={receivedOn}
                  onChange={(e) => setReceivedOn(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </div>

              {/* Optional Payment Screenshot Upload */}
              <div>
                <label className="text-sm font-medium text-foreground">
                  Attach Payment Proof / Receipt <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                </label>
                <div className="mt-1">
                  {!manualReceiptPreview ? (
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-muted/20 p-3 text-xs text-muted-foreground hover:bg-muted/40 transition">
                      <UploadCloud className="h-4 w-4 text-primary" /> Click to attach receipt image (Cloudinary CDN)
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => setManualReceiptPreview(reader.result as string);
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-2.5">
                      <img
                        src={manualReceiptPreview}
                        alt="Receipt preview"
                        className="h-10 w-10 rounded object-cover border"
                      />
                      <span className="text-xs text-muted-foreground flex-1">Receipt ready for upload</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setManualReceiptPreview(null)}
                        className="h-7 text-xs text-destructive hover:bg-destructive/10"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setManualReceiptPreview(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={manualReceiptUploading}>
                  {manualReceiptUploading ? "Uploading to CDN…" : "Add to Public Ledger"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- PAYMENT RECEIPT LIGHTBOX MODAL ---------------- */}
      {viewReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-xs animate-rise">
          <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border bg-card p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    Payment Verification Receipt
                  </h3>
                  <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    CDN Asset
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Donor: <span className="font-semibold text-foreground">{viewReceiptModal.donor}</span>
                  {viewReceiptModal.amount && ` • Amount: ${formatRs(viewReceiptModal.amount)}`}
                  {viewReceiptModal.date &&
                    ` • Date: ${new Date(viewReceiptModal.date).toLocaleDateString("en-PK")}`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewReceiptModal(null)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-auto py-5 text-center">
              <img
                src={viewReceiptModal.url}
                alt="Receipt screenshot"
                className="mx-auto max-h-[60vh] rounded-lg border object-contain shadow-md bg-black/5"
              />
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <a
                href={viewReceiptModal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open full original in new tab
              </a>
              <Button size="sm" onClick={() => setViewReceiptModal(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- GENERAL CONFIRMATION & ALERT MODAL ---------------- */}
      <ConfirmationModal
        open={confirmModal.open}
        onOpenChange={(open) => setConfirmModal((prev) => ({ ...prev, open }))}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        variant={confirmModal.variant}
        icon={confirmModal.icon}
        loading={confirmModal.loading}
        onConfirm={confirmModal.onConfirm}
      />
    </div>
  );
}
