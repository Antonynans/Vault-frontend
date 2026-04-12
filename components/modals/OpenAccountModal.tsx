import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { accountsApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

interface OpenAccountModalProps {
  showCreate: boolean;
  setShowCreate: (value: boolean) => void;
  fetchAccounts: () => void;
}

const OpenAccountModal = ({
  showCreate,
  setShowCreate,
  fetchAccounts,
}: OpenAccountModalProps) => {
  const { add } = useToast();
  const [creating, setCreating] = useState(false);
  const [currency, setCurrency] = useState("NGN");
  const [name, setName] = useState("savings");

  const handleCreate = async () => {
    setCreating(true);
    try {
      await accountsApi.create({ currency, type: name || undefined });
      add("success", `${currency} account created!`);
      setShowCreate(false);
      setCurrency("NGN");
      setName("");
      fetchAccounts();
    } catch (err: any) {
      add("error", err?.response?.data?.message || "Failed");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      open={showCreate}
      onClose={() => setShowCreate(false)}
      title="Open New Account"
    >
      <div className="space-y-4">
        <Select
          label="Currency"
          options={["NGN", "USD", "GBP", "EUR"].map((c) => ({
            value: c,
            label: `${c} — ${c === "NGN" ? "Nigerian Naira" : c === "USD" ? "US Dollar" : c === "GBP" ? "British Pound" : "Euro"}`,
          }))}
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        />
        <Select
          label="Account Type"
          options={[
            { value: "savings", label: "Savings" },
            { value: "current", label: "Current" },
            { value: "wallet", label: "Wallet" },
          ]}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div
          className="glass rounded-xl p-4 text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          <p>
            New accounts start with{" "}
            <strong style={{ color: "var(--gold)" }}>Basic</strong> wallet tier.
            Complete KYC to upgrade limits.
          </p>
        </div>
        <Button loading={creating} onClick={handleCreate} className="w-full">
          Open Account
        </Button>
      </div>
    </Modal>
  );
};

export default OpenAccountModal;
