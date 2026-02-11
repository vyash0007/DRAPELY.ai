import { getAdminCustomers } from '@/actions/admin-customers';
import { CustomerTable } from '@/components/admin/customer-table';
import { CustomerFilters } from '@/components/admin/customer-filters';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || '';

  const { customers, pagination } = await getAdminCustomers({
    search,
    page,
    limit: 20,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-4xl font-light tracking-wide text-gray-900">Customers</h1>
        <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600">Manage and view customer information</p>
      </div>

      {/* Filters */}
      <CustomerFilters />

      {/* Customer Table */}
      <CustomerTable customers={customers} pagination={pagination} />
    </div>
  );
}

