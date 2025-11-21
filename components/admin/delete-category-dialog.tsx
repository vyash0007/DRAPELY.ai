'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteCategory } from '@/actions/admin-categories';

interface DeleteCategoryDialogProps {
  categoryId: string | null;
  onClose: () => void;
}

export function DeleteCategoryDialog({
  categoryId,
  onClose,
}: DeleteCategoryDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!categoryId) return;

    setLoading(true);
    try {
      const result = await deleteCategory(categoryId);
      if (result.success) {
        router.refresh();
        onClose();
      } else {
        alert(result.error || 'Failed to delete category');
      }
    } catch (error) {
      alert('An error occurred while deleting the category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={!!categoryId} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the category
            from your store. Categories with associated products cannot be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

