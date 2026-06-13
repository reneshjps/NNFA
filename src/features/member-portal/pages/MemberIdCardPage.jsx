import { Download, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../../store/authStore';
import { downloadIdCardPdf } from '../../../services/idCardService';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import MemberIdCard from '../../../components/data-display/MemberIdCard';

export default function MemberIdCardPage() {
  const { user } = useAuthStore();

  const handleDownload = async () => {
    try {
      await downloadIdCardPdf(user);
      toast.success('ID card PDF generated.');
    } catch (err) {
      toast.error(err.message || 'Unable to generate PDF.');
    }
  };

  return (
    <div className="page-enter">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My ID Card</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Download or print your verified digital membership card.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" leftIcon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
            Print
          </Button>
          <Button leftIcon={<Download className="w-4 h-4" />} onClick={handleDownload}>
            Download PDF
          </Button>
        </div>
      </div>
      <Card>
        <Card.Content className="flex justify-center py-8">
          <MemberIdCard member={user} />
        </Card.Content>
      </Card>
    </div>
  );
}
