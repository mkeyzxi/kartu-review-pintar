import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    Timestamp,
    QueryConstraint,
    DocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Link, CreateLinkInput, UpdateLinkInput } from "@/types/link";

const COLLECTION_NAME = "links";

/**
 * Get link by slug
 */
export async function getLinkBySlug(slug: string): Promise<Link | null> {
    const docRef = doc(db, COLLECTION_NAME, slug);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    return {
        id: docSnap.id,
        ...docSnap.data(),
    } as Link;
}

/**
 * Get link by ID
 */
export async function getLinkById(id: string): Promise<Link | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    return {
        id: docSnap.id,
        ...docSnap.data(),
    } as Link;
}

/**
 * Create new link
 */
export async function createLink(input: CreateLinkInput): Promise<Link> {
    const now = Timestamp.now();
    const docRef = doc(db, COLLECTION_NAME, input.slug);

    const linkData = {
        slug: input.slug,
        storeName: input.storeName || null,
        label: input.label || null,
        phoneNumber: input.phoneNumber || null,
        urlGmb: input.urlGmb || null,
        isClaimed: input.isClaimed || false,
        pinHash: input.pinHash || null,
        isSuspended: input.isSuspended || false,
        expiredAt: input.expiredAt || null,
        createdAt: now,
        updatedAt: now,
    };

    await setDoc(docRef, linkData);

    return {
        id: input.slug,
        ...linkData,
    } as Link;
}

/**
 * Update link
 */
export async function updateLink(
    id: string,
    input: UpdateLinkInput,
): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updateData = {
        ...input,
        updatedAt: Timestamp.now(),
    };

    await updateDoc(docRef, updateData);
}

/**
 * Delete link
 */
export async function deleteLink(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
}

export async function getLinks(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: "active" | "inactive" | "suspended" | "expired";
}): Promise<{
    links: Link[];
    total: number;
}> {
    const { page = 1, limit: pageSize = 20, search, status } = options;

    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);

    let links = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Link[];

    // Sort by createdAt desc by default
    links.sort((a, b) => {
        const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt as string);
        const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt as string);
        return dateB.getTime() - dateA.getTime();
    });

    // Apply Search
    if (search) {
        const searchLower = search.toLowerCase();
        links = links.filter(link => 
            link.slug.toLowerCase().includes(searchLower) || 
            (link.storeName && link.storeName.toLowerCase().includes(searchLower))
        );
    }

    // Apply Status
    if (status) {
        const now = new Date();
        if (status === "active") {
            links = links.filter(link => link.isClaimed && !link.isSuspended);
        } else if (status === "inactive") {
            links = links.filter(link => !link.isClaimed);
        } else if (status === "suspended") {
            links = links.filter(link => link.isSuspended);
        } else if (status === "expired") {
            links = links.filter(link => {
                if (!link.expiredAt) return false;
                const expDate = link.expiredAt instanceof Timestamp ? link.expiredAt.toDate() : new Date(link.expiredAt as string);
                return expDate <= now;
            });
        }
    }

    const total = links.length;
    
    // Pagination
    const startIndex = (page - 1) * pageSize;
    const paginatedLinks = links.slice(startIndex, startIndex + pageSize);

    return {
        links: paginatedLinks,
        total,
    };
}

/**
 * Get links count by status
 */
export async function getLinksCount(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    expired: number;
}> {
    const q = query(collection(db, COLLECTION_NAME));
    const snapshot = await getDocs(q);

    const now = Timestamp.now();
    let active = 0;
    let inactive = 0;
    let suspended = 0;
    let expired = 0;

    snapshot.docs.forEach((doc) => {
        const data = doc.data();

        if (data.isSuspended) {
            suspended++;
        } else if (!data.isClaimed) {
            inactive++;
        } else if (data.expiredAt && data.expiredAt <= now) {
            expired++;
        } else {
            active++;
        }
    });

    return {
        total: snapshot.size,
        active,
        inactive,
        suspended,
        expired,
    };
}
