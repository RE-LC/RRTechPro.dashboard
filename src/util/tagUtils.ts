import { toast } from "sonner";
import { Tag } from "@prisma/client";
import axios from "axios";

const API_BASE_URL = process.env.API_BASE_URL;

// Create a tag in the backend
export const createTag = async (tagName: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/tags`, { tagName }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.data && response.data.id && response.data.name) {
            return { id: response.data.id, name: response.data.name };
        } else {
            throw new Error("Invalid response structure from backend.");
        }
    } catch (error) {
        handleAxiosError(error);
        throw new Error("Error creating tag!");
    }
};

// Handle Axios errors
const handleAxiosError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        // Now TypeScript knows that `error` is of type `AxiosError`
        if (error.response) {
            console.error('Axios error response:', error.response);
        } else if (error.request) {
            console.error('Axios error request:', error.request);
        } else {
            console.error('Axios error message:', error.message);
        }
    } else {
        // Handle non-Axios errors (or errors without response/request)
        console.error('General error:', error);
    }
};


// Add a new tag to the form and database
export const handleAddTag = async (
    tagName: string,
    form: any,
    setAvailableTags: React.Dispatch<React.SetStateAction<Tag[]>>,
) => {
    const tags = form.getValues("tags") || [];
    const capitalizedTagName = tagName.trim().toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

    if (tags.some((tag: { name: string; }) => tag.name.toLowerCase() === capitalizedTagName)) {
        toast.warning("Tag already exists!", { richColors: true });
        return;
    }

    if (tags.length >= 5) {
        toast.warning("Max limit reached!", { richColors: true });
        return;
    }

    try {
        const newTag = await createTag(capitalizedTagName);
        form.setValue("tags", [...tags, newTag]);
        setAvailableTags((prevTags) => [...prevTags, newTag]);
        toast.success("Tag created successfully!", { richColors: true });
    } catch (error) {
        toast.error("Error creating tag!", { richColors: true });
    }
};

// Remove a tag from the form
export const handleRemoveTag = (
    index: number,
    form: any,
    setAvailableTags: React.Dispatch<React.SetStateAction<Tag[]>>,
) => {
    const tags = form.getValues("tags") || [];
    const newTags = tags.filter((_: any, i: number) => i !== index);
    form.setValue("tags", newTags);
    setAvailableTags(tags.filter((_: any, i: number) => i !== index));
};

// Remove a tag from the database
export const handleRemoveTagFromDb = async (tagId: string) => {
    try {
        await axios.delete(`${API_BASE_URL}/tags/${tagId}`);
        toast.success("Tag deleted from database!");
    } catch (error) {
        toast.error("Error deleting tag!");
    }
};

// Filter tags based on the input value
export const filterTags = (
    availableTags: Tag[],
    inputValue: string,
    selectedTags: Tag[] = []
): Tag[] => {
    return availableTags.filter(
        (tag) =>
            tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
            !selectedTags.some((selectedTag) => selectedTag.id === tag.id)
    );
};

// Handle the tag selection process
export const handleTagSelection = (
    tag: Tag,
    form: any,
    setInputValue: React.Dispatch<React.SetStateAction<string>>
) => {
    const currentTags = form.getValues("tags") || [];
    if (!currentTags.some((t: { id: string }) => t.id === tag.id)) {
        form.setValue("tags", [...currentTags, tag]);
        setInputValue(""); // Clear input after selection
    }
};

// Arrow key navigation logic for suggestions
export const handleArrowKeyNavigation = (
    e: React.KeyboardEvent,
    filteredTags: Tag[],
    setSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>,
    selectedIndex: number | null,
    handleTagSelection: (tag: Tag, form: any, setInputValue: React.Dispatch<React.SetStateAction<string>>) => void,
    form: any
) => {
    if (filteredTags.length > 0) {
        if (e.key === "ArrowDown") {
            setSelectedIndex((prevIndex) =>
                prevIndex === null ? 0 : Math.min(prevIndex + 1, filteredTags.length - 1)
            );
        } else if (e.key === "ArrowUp") {
            setSelectedIndex((prevIndex) =>
                prevIndex === null ? filteredTags.length - 1 : Math.max(prevIndex - 1, 0)
            );
        } else if (e.key === "Enter" && selectedIndex !== null) {
            e.preventDefault();
            const selectedTag = filteredTags[selectedIndex];
            if (selectedTag) {
                handleTagSelection(selectedTag, form, () => { });
                setSelectedIndex(null); // Reset selected index after selection
            }
        }
    }
};

// Check if the user has typed a new tag (not in availableTags)
export const getNewTagText = (
    inputValue: string,
    filteredTags: Tag[],
    availableTags: Tag[]
): string | null => {
    const existingTag = availableTags.find((tag) =>
        tag.name.toLowerCase() === inputValue.toLowerCase()
    );
    if (!existingTag && inputValue.trim() !== "") {
        return `Create "${inputValue.trim()}"`; // Show this if no matching tag is found
    }
    return null;
};
