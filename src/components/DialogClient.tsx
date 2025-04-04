'use client';

import React, { FC, ReactNode, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import CategoryForm from "@/components/forms/category-form";
import { Category } from '@prisma/client';
import { useRouter } from 'next/navigation';

interface DialogClientProps {
  category?: Category
}

const DialogClient = ({ category }: DialogClientProps) => {
  // Manage the open/close state of the dialog in the client component
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    router.back();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="dialog-content">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Create New Category"}</DialogTitle>
          <DialogDescription>
            {category
              ? `Edit the details of the category: ${category.name}`
              : "Please enter the name and details of the new category you wish to create."}
          </DialogDescription>
        </DialogHeader>
        <CategoryForm initialData={category || undefined} />
      </DialogContent>
    </Dialog>
  );
};

export default DialogClient;
