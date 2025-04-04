"use client";

import * as z from "zod";
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Category, Post, Tag } from "@prisma/client";
import { Input } from "@/components/ui/input";
import ImageUpload from "@/components/image-upload";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, X } from "lucide-react";
import {
  handleAddTag,
  handleRemoveTag,
  handleRemoveTagFromDb,
  filterTags,
  handleTagSelection,
} from "@/util/tagUtils";
import axios from "axios";
import { Heading } from "@/components/ui/heading";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false })

// Form validation schema
const formSchema = z.object({
  title: z
    .string()
    .nonempty({ message: "Title cannot be empty!" })
    .min(10, { message: "Title must be at least 10 characters." })
    .max(100, { message: "Title must be within 100 characters." }),
  description: z
    .string()
    .nonempty({ message: "Description cannot be empty!" })
    .max(200, { message: "Description must be within 200 characters." }),
  published: z
    .boolean()
    .default(false)
    .optional(),
  coverImage: z
    .string()
    .url(),
  tags: z
    .array(z.object({ id: z.string(), name: z.string() }))
    .nonempty({ message: "Tag field cannot be empty" })
    .max(5, { message: "You can add up to 5 tags only." }),
  category: z
    .object({ id: z.string(), name: z.string() }, { message: "Category is required." })
    .optional(),
  content: z
    .string()
    .nonempty({ message: "Content is required." }),
});

type PostFormValues = z.infer<typeof formSchema>

interface PostFormProps {
  tags: Tag[]
  categories: Category[]
  initialData?: Post
}

const API_BASE_URL = process.env.API_BASE_URL;

export default function PostForm({ tags, categories, initialData }: PostFormProps) {
  const [, setIsClient] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>(tags);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const title = initialData ? 'Edit post' : 'Create new post';
  const description = initialData ? 'Edit a post.' : 'Add a new post';
  const toastMessage = initialData ? 'Post sucessfully updated!' : 'Post sucessfully created!';
  const action = initialData ? 'Save changes' : 'Create';

  const form = useForm<PostFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      published: false,
      tags: [],
      coverImage: "",
      content: "",
      category: undefined
    },
    mode: "onBlur",
  });

  useEffect(() => {
    setIsClient(true);
    setAvailableTags(tags); // Initialize availableTags when tags prop is first loaded
  }, [tags]);

  const [inputValue, setInputValue] = useState("");
  const [filteredTags, setFilteredTags] = useState<Tag[]>(availableTags);
  const [focused, setFocused] = useState(false);
  const [newTagText, setNewTagText] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const filtered = filterTags(availableTags, inputValue, form.getValues("tags"));
    setFilteredTags(filtered);

    // Set newTagText if no tags match the input value
    if (filtered.length === 0 && inputValue.trim()) {
      setNewTagText(`Create "${inputValue.trim()}"`);
    } else {
      setNewTagText(null); // Reset when there are matching tags
    }
  }, [availableTags, inputValue, form]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault(); // Prevent form submission

      // Check if a tag is selected or if the input matches a new tag
      if (newTagText) {
        handleAddTag(inputValue.trim(), form, setAvailableTags);
        setInputValue("");
      } else if (selectedIndex !== null && filteredTags[selectedIndex]) {
        handleTagSelection(filteredTags[selectedIndex], form, setInputValue);
        setSelectedIndex(null); // Reset the selected index after selection
      }
    } else if (e.key === "ArrowDown") {
      if (filteredTags.length > 0) {
        setSelectedIndex((prevIndex) =>
          prevIndex === null ? 0 : Math.min(prevIndex + 1, filteredTags.length - 1)
        );
      }
    } else if (e.key === "ArrowUp") {
      if (filteredTags.length > 0) {
        setSelectedIndex((prevIndex) =>
          prevIndex === null ? filteredTags.length - 1 : Math.max(prevIndex - 1, 0)
        );
      }
    }
  };

  const handleMouseSelect = (tag: Tag) => {
    handleTagSelection(tag, form, setInputValue);
    setSelectedIndex(null); // Clear selection after mouse click
    setInputValue(""); // Clear the input field after selection
  };

  const handleCategoryChange = (category: Category) => {
    form.setValue("category", category);
  };

  async function onSubmit(values: PostFormValues) {
    setLoading(true)
    try {
      if (initialData) {
        await axios.post(`${API_BASE_URL}/post/${initialData.id}`, values);
      } else {
        await axios.post(`${API_BASE_URL}/post`, values);
      }

      router.push("/posts");
      router.refresh();

      toast.success(`${toastMessage}`, { richColors: true });
      console.log(values);
    } catch (error) {
      toast.error('Something went wrong while submitting the form.', { richColors: true });
      console.error('Error during submission:', error);
    } finally {
      setLoading(false)
    }

  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 bg-white rounded-lg w-full">
        <Heading title={title} description={description} />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="title" className="text-lg font-medium">Title</FormLabel>
              <FormControl>
                <Input
                  id="title"
                  placeholder="Enter a title"
                  {...field}
                  className="w-full border-gray-300 focus:ring-2 focus:ring-indigo-600"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="coverImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-medium">Cover image</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value ? [field.value] : []}
                  disabled={loading}
                  onChange={(url) => field.onChange(url)}
                  onRemove={() => field.onChange('')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="description" className="text-lg font-medium">Description</FormLabel>
              <FormControl>
                <Textarea
                  id="description"
                  placeholder="Enter a description"
                  {...field}
                  className="w-full border-gray-300 focus:ring-2 focus:ring-indigo-600"
                />
              </FormControl>
              <FormDescription>Provide a brief description (max 200 characters).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-lg font-medium">Content</FormLabel>
              <FormDescription>Enter the post content.</FormDescription>
              <FormControl>
                <Editor markdown="" onChange={(value) => { field.onChange(value) }} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel htmlFor="category" className="text-lg font-medium">Category</FormLabel>
              <FormControl>
                <Select value={field.value?.id} onValueChange={(id) => handleCategoryChange(categories.find(c => c.id === id)!)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="tags"
          control={form.control}
          render={({ field }) => {
            return (
              <FormItem className="space-y-2">
                <FormLabel htmlFor="tags" className="text-lg font-medium">Tags</FormLabel>
                <FormControl>
                  <div className="relative flex flex-col space-y-2">
                    <div className="relative flex gap-2">
                      <Input
                        id="tagInput"
                        placeholder="Add a tag"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        autoComplete="off" // Disable browser autocomplete suggestions
                        className="w-full border-gray-300 focus:ring-2 focus:ring-indigo-600 rounded-md p-2"
                      />

                      {/* Suggestions box below input */}
                      {focused && (inputValue || filteredTags.length > 0 || newTagText) && (
                        <div className="absolute z-10 w-full mt-10 bg-white border border-gray-200 rounded-md shadow-md max-h-48 overflow-y-auto">
                          <div className="p-2">
                            {newTagText ? (
                              <div
                                className="cursor-pointer py-1 px-3 text-sm text-gray-500 hover:bg-indigo-200"
                                onClick={() => handleAddTag(inputValue.trim(), form, setAvailableTags)}
                              >
                                {newTagText}
                              </div>
                            ) : filteredTags.length === 0 ? (
                              <div className="text-gray-500 px-3 py-1">No tags available</div>
                            ) : (
                              filteredTags.slice(0, 5).map((tag, index) => (
                                <div
                                  key={tag.id}
                                  className={`cursor-pointer py-1 px-3 rounded-md text-sm flex items-center justify-between  ${selectedIndex === index ? "bg-indigo-200" : "hover:bg-indigo-200"}`}
                                  onMouseDown={() => {
                                    handleMouseSelect(tag);
                                  }}
                                >
                                  {tag.name}

                                  <Button
                                    type="button"
                                    size={"icon"}
                                    variant={"outline"}
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      handleRemoveTagFromDb(tag.id);
                                    }}
                                    className="text-sm ml-2 text-gray-500 hover:text-red-500"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Display added tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {field.value?.map((tag: Tag, index: number) => (
                        <Badge
                          key={index}
                          className="bg-indigo-500 text-white flex items-center justify-between py-1 px-3 rounded-md"
                        >
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(index, form, setAvailableTags)}
                            className="ml-2 text-sm text-white hover:text-indigo-200"
                          >
                            <X size={16} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <FormField
          control={form.control}
          name="published"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between space-y-2">
              <div className="space-y-0.5">
                <FormLabel htmlFor="published" className="text-lg font-medium">Published</FormLabel>
                <FormDescription>Mark this post as published.</FormDescription>
              </div>
              <FormControl>
                <Switch
                  id="published"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {action}
        </Button>
      </form>
    </Form >
  );
}
