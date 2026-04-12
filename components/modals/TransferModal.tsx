import { useState } from "react";
import Modal from "../ui/Modal";
import { useToast } from "../ui/Toast";
import Select from "../ui/Select";
import Input from "../ui/Input";
import { transactionsApi } from "@/lib/api";
import Button from "../ui/Button";

interface TransferModalProps {
  showTransfer: boolean;
  setShowTransfer: (value: boolean) => void;
  accountOptions: { value: string; label: string }[];
  fetchData: () => void;
  formLoading: boolean;
  setFormLoading: (value: boolean) => void;
}

const TransferModal = ({
  accountOptions,
  formLoading,
  setFormLoading,
  showTransfer,
  setShowTransfer,
  fetchData,
}: TransferModalProps) => {
  const { add } = useToast();
  const [transferForm, setTransferForm] = useState({
    fromAccountId: "",
    toAccountId: "",
    amount: "",
    description: "",
  });

  const handleTransfer = async () => {
    if (
      !transferForm.fromAccountId ||
      !transferForm.toAccountId ||
      !transferForm.amount
    )
      return;
    setFormLoading(true);
    try {
      await transactionsApi.transfer({
        fromAccountId: transferForm.fromAccountId,
        toAccountId: transferForm.toAccountId,
        amount: parseFloat(transferForm.amount) * 100,
        description: transferForm.description,
      });
      add("success", "Transfer successful!");
      setShowTransfer(false);
      setTransferForm({
        fromAccountId: "",
        toAccountId: "",
        amount: "",
        description: "",
      });
      fetchData();
    } catch (err: any) {
      add("error", err?.response?.data?.message || "Transfer failed");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Modal
      open={showTransfer}
      onClose={() => setShowTransfer(false)}
      title="Transfer Funds"
    >
      <div className="space-y-4">
        <Select
          label="From Account"
          options={[
            { value: "", label: "Select account..." },
            ...accountOptions,
          ]}
          value={transferForm.fromAccountId}
          onChange={(e) =>
            setTransferForm((f) => ({ ...f, fromAccountId: e.target.value }))
          }
        />
        <Input
          label="To Account ID"
          placeholder="Recipient account ID"
          value={transferForm.toAccountId}
          onChange={(e) =>
            setTransferForm((f) => ({ ...f, toAccountId: e.target.value }))
          }
        />
        <Input
          label="Amount"
          type="number"
          placeholder="0.00"
          value={transferForm.amount}
          onChange={(e) =>
            setTransferForm((f) => ({ ...f, amount: e.target.value }))
          }
        />
        <Input
          label="Description (optional)"
          placeholder="What's this for?"
          value={transferForm.description}
          onChange={(e) =>
            setTransferForm((f) => ({ ...f, description: e.target.value }))
          }
        />
        <Button
          loading={formLoading}
          onClick={handleTransfer}
          className="w-full"
        >
          Send Transfer
        </Button>
      </div>
    </Modal>
  );
};

export default TransferModal;
