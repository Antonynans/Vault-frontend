import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "../ui/Toast";
import { transactionsApi } from "@/lib/api";

interface DepositModalProps {
  showDeposit: boolean;
  depositForm: { accountId: string; amount: string };
  setShowDeposit: (value: boolean) => void;
  setDepositForm: (
    form:
      | { accountId: string; amount: string }
      | ((prev: { accountId: string; amount: string }) => {
          accountId: string;
          amount: string;
        }),
  ) => void;
  accountOptions: { value: string; label: string }[];
  fetchData: () => void;
  formLoading: boolean;
  setFormLoading: (value: boolean) => void;
}

const DepositModal = ({
  showDeposit,
  depositForm,
  setShowDeposit,
  setDepositForm,
  accountOptions,
  fetchData,
  formLoading,
  setFormLoading,
}: DepositModalProps) => {
  const { add } = useToast();

  const handleDeposit = async () => {
    if (!depositForm.accountId || !depositForm.amount) return;
    setFormLoading(true);
    try {
      await transactionsApi.deposit({
        accountId: depositForm.accountId,
        amount: parseFloat(depositForm.amount) * 100,
      });
      add("success", "Deposit successful!");
      setShowDeposit(false);
      setDepositForm({ accountId: "", amount: "" });
      fetchData();
    } catch (err: any) {
      add("error", err?.response?.data?.message || "Deposit failed");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Modal
      open={showDeposit}
      onClose={() => setShowDeposit(false)}
      title="Deposit Funds"
    >
      <div className="space-y-4">
        <Select
          label="Account"
          options={[
            { value: "", label: "Select account..." },
            ...accountOptions,
          ]}
          value={depositForm.accountId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setDepositForm((f: typeof depositForm) => ({
              ...f,
              accountId: e.target.value,
            }))
          }
        />
        <Input
          label="Amount (₦)"
          type="number"
          placeholder="0.00"
          value={depositForm.amount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setDepositForm((f: typeof depositForm) => ({
              ...f,
              amount: e.target.value,
            }))
          }
        />
        <Button
          loading={formLoading}
          onClick={handleDeposit}
          className="w-full"
        >
          Deposit
        </Button>
      </div>
    </Modal>
  );
};

export default DepositModal;
