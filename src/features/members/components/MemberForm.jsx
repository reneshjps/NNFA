import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Upload, Camera, FileText, MapPin, User, Shield, Briefcase, Heart, Truck } from 'lucide-react';
import { DISTRICTS, BLOOD_GROUPS, DESIGNATIONS } from '../../../utils/constants';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Card from '../../../components/ui/Card';
import { memberService } from '../../../services/memberService';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

export default function MemberForm({ initialData = null, onSubmit, isLoading = false }) {
  const isEdit = !!initialData;
  const [photoPreview, setPhotoPreview] = useState(initialData?.photo_url || '');
  const [sigPreview, setSigPreview] = useState(initialData?.signature_url || '');
  
  // File upload states
  const [photoFile, setPhotoFile] = useState(null);
  const [sigFile, setSigFile] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingSig, setIsUploadingSig] = useState(false);

  // Expiry date calculation helper
  const [duration, setDuration] = useState('1_year');

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      occupation: initialData?.occupation || '',
      village: initialData?.village || '',
      district: initialData?.district || '',
      taluk: initialData?.taluk || '',
      address: initialData?.address || '',
      mobile: initialData?.mobile || '',
      dob: initialData?.dob || '',
      aadhar_number: initialData?.aadhar_number || '',
      vehicle_number: initialData?.vehicle_number || '',
      designation: initialData?.designation || 'Member',
      blood_group: initialData?.blood_group || '',
      joining_date: initialData?.joining_date || dayjs().format('YYYY-MM-DD'),
      valid_until: initialData?.valid_until || dayjs().add(1, 'year').format('YYYY-MM-DD'),
      status: initialData?.status || 'active',
      registration_number: initialData?.registration_number || '',
    },
  });

  const watchJoiningDate = useWatch({ control, name: 'joining_date' });

  // Handle auto-calculating expiration date
  useEffect(() => {
    if (duration === 'custom' || isEdit) return;

    const start = watchJoiningDate ? dayjs(watchJoiningDate) : dayjs();
    let end;

    if (duration === '1_year') {
      end = start.add(1, 'year');
    } else if (duration === '3_years') {
      end = start.add(3, 'years');
    } else if (duration === 'lifetime') {
      end = start.add(100, 'years'); // 100 years represents lifetime membership
    }

    setValue('valid_until', end.format('YYYY-MM-DD'));
  }, [duration, watchJoiningDate, setValue, isEdit]);

  // Photo upload handler
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo file size exceeds 5MB limit.');
      return;
    }

    // Preview immediately
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoFile(file);
  };

  // Signature upload handler
  const handleSigChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Signature file size exceeds 2MB limit.');
      return;
    }

    // Preview immediately
    setSigPreview(URL.createObjectURL(file));
    setSigFile(file);
  };

  const handleFormSubmit = async (data) => {
    try {
      let photoUrl = initialData?.photo_url || '';
      let signatureUrl = initialData?.signature_url || '';

      // 1. Upload photo if changed
      if (photoFile) {
        setIsUploadingPhoto(true);
        photoUrl = await memberService.uploadFile('photos', photoFile);
        setIsUploadingPhoto(false);
      }

      // 2. Upload signature if changed
      if (sigFile) {
        setIsUploadingSig(true);
        signatureUrl = await memberService.uploadFile('signatures', sigFile);
        setIsUploadingSig(false);
      }

      // 3. Trigger parent submit callback with complete payload
      onSubmit({
        ...data,
        photo_url: photoUrl,
        signature_url: signatureUrl,
      });
    } catch (error) {
      toast.error(error.message || 'Error uploading file assets.');
      setIsUploadingPhoto(false);
      setIsUploadingSig(false);
    }
  };

  const isWorking = isLoading || isUploadingPhoto || isUploadingSig;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Photos & Signatures */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Member Photo */}
          <Card>
            <Card.Content className="pt-6 text-center">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-4">Member Photo</span>
              <div className="relative w-36 h-36 rounded-full bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 flex items-center justify-center mx-auto group overflow-hidden shadow-inner">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Member Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-10 h-10 text-gray-300 dark:text-gray-500" />
                )}
                <label className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-medium">
                  <Upload className="w-4 h-4 mb-1" />
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    disabled={isWorking}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-3">JPEG, PNG up to 5MB.</p>
            </Card.Content>
          </Card>

          {/* Member Signature */}
          <Card>
            <Card.Content className="pt-6 text-center">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-4">Member Signature</span>
              <div className="relative h-24 bg-gray-50 dark:bg-slate-700/50 border-2 border-dashed border-gray-200 dark:border-slate-600 rounded-lg flex items-center justify-center group overflow-hidden">
                {sigPreview ? (
                  <img
                    src={sigPreview}
                    alt="Signature Preview"
                    className="h-full object-contain p-2"
                  />
                ) : (
                  <FileText className="w-8 h-8 text-gray-300 dark:text-gray-500" />
                )}
                <label className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-medium">
                  <Upload className="w-4 h-4 mb-1" />
                  Upload Signature
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSigChange}
                    className="hidden"
                    disabled={isWorking}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-3">Clear JPEG, PNG up to 2MB.</p>
            </Card.Content>
          </Card>
        </div>

        {/* Right Column: Member Form Details */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <Card.Header>
              <Card.Title>Farmer Personal details</Card.Title>
              <Card.Description>Primary registry details of the member.</Card.Description>
            </Card.Header>
            <Card.Content className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="Enter full name"
                  leftIcon={<User className="w-4 h-4" />}
                  required
                  error={errors.name?.message}
                  {...register('name', { required: 'Name is required' })}
                />

                <Input
                  label="Occupation"
                  placeholder="e.g. Paddy Farmer, Agriculturist"
                  leftIcon={<Briefcase className="w-4 h-4" />}
                  error={errors.occupation?.message}
                  {...register('occupation')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Mobile Number"
                  placeholder="10-digit mobile number"
                  required
                  error={errors.mobile?.message}
                  {...register('mobile', {
                    required: 'Mobile is required',
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: 'Invalid 10-digit mobile number',
                    },
                  })}
                />

                <Input
                  label="Date of Birth"
                  type="date"
                  required
                  error={errors.dob?.message}
                  {...register('dob', { required: 'Date of birth is required' })}
                />

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Heart className="w-4 h-4 text-gray-400" />
                    Blood Group
                  </label>
                  <select
                    {...register('blood_group')}
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-green-500 text-gray-700 dark:text-gray-300"
                  >
                    <option value="">Select blood group</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Aadhar Number"
                  placeholder="12-digit Aadhar number"
                  error={errors.aadhar_number?.message}
                  {...register('aadhar_number', {
                    pattern: {
                      value: /^\d{12}$/,
                      message: 'Aadhar must be exactly 12 digits',
                    },
                  })}
                />

                <Input
                  label="Vehicle Number"
                  placeholder="e.g. TN-37-AB-1234"
                  leftIcon={<Truck className="w-4 h-4" />}
                  error={errors.vehicle_number?.message}
                  {...register('vehicle_number')}
                />
              </div>
            </Card.Content>
          </Card>

          {/* Geographical details */}
          <Card>
            <Card.Header>
              <Card.Title>Geographical & Address Details</Card.Title>
              <Card.Description>Location breakdown for village mapping.</Card.Description>
            </Card.Header>
            <Card.Content className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    District *
                  </label>
                  <select
                    required
                    {...register('district', { required: 'District is required' })}
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-green-500 text-gray-700 dark:text-gray-300"
                  >
                    <option value="">Select district</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.district && (
                    <p className="text-xs text-red-500">{errors.district.message}</p>
                  )}
                </div>

                <Input
                  label="Taluk"
                  placeholder="e.g. Mettur"
                  error={errors.taluk?.message}
                  {...register('taluk')}
                />

                <Input
                  label="Village"
                  placeholder="e.g. Omalur"
                  error={errors.village?.message}
                  {...register('village')}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Residential Address
                </label>
                <textarea
                  placeholder="Enter full address details"
                  rows={3}
                  {...register('address')}
                  className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-700 dark:text-gray-300"
                />
              </div>
            </Card.Content>
          </Card>

          {/* Association Details */}
          <Card>
            <Card.Header>
              <Card.Title>Association Details</Card.Title>
              <Card.Description>Role and validity of the farmer registration.</Card.Description>
            </Card.Header>
            <Card.Content className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Shield className="w-4 h-4 text-gray-400" />
                    Designation *
                  </label>
                  <select
                    required
                    {...register('designation', { required: 'Designation is required' })}
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-green-500 text-gray-700 dark:text-gray-300"
                  >
                    {DESIGNATIONS.map((des) => (
                      <option key={des} value={des}>{des}</option>
                    ))}
                  </select>
                </div>

                {/* Status selector (available on edit mode) */}
                {isEdit ? (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Membership Status
                    </label>
                    <select
                      {...register('status')}
                      className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-green-500 text-gray-700 dark:text-gray-300"
                    >
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Membership Type
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-green-500 text-gray-700 dark:text-gray-300"
                    >
                      <option value="1_year">1 Year Membership</option>
                      <option value="3_years">3 Year Membership</option>
                      <option value="lifetime">Lifetime Membership</option>
                      <option value="custom">Custom Duration</option>
                    </select>
                  </div>
                )}

                <Input
                  label="Registration Number"
                  placeholder="e.g. REG-001 (Optional)"
                  error={errors.registration_number?.message}
                  {...register('registration_number')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Joining Date"
                  type="date"
                  required
                  error={errors.joining_date?.message}
                  {...register('joining_date', { required: 'Joining date is required' })}
                />

                <Input
                  label="Valid Until"
                  type="date"
                  required
                  disabled={duration !== 'custom' && !isEdit}
                  error={errors.valid_until?.message}
                  {...register('valid_until', { required: 'Expiry date is required' })}
                  className={duration !== 'custom' && !isEdit ? 'bg-gray-50 dark:bg-slate-800/50 cursor-not-allowed' : ''}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => window.history.back()}
                  disabled={isWorking}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isWorking}
                >
                  {isEdit ? 'Save Changes' : 'Register Member'}
                </Button>
              </div>
            </Card.Content>
          </Card>
        </div>

      </div>
    </form>
  );
}
