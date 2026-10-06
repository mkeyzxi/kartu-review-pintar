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
    lastDoc?: DocumentSnapshot | null;
}): Promise<{
    links: Link[];
    lastDoc: DocumentSnapshot | null;
    total: number;
}> {
    const { page = 1, limit: pageSize = 20, search, status, lastDoc } = options;

    const constraints: QueryConstraint[] = [];

    // Status filter
    if (status) {
        const now = Timestamp.now();
        switch (status) {
            case "active":
                constraints.push(where("isClaimed", "==", true));
                constraints.push(where("isSuspended", "==", false));
                break;
            case "inactive":
                constraints.push(where("isClaimed", "==", false));
                break;
            case "suspended":
                constraints.push(where("isSuspended", "==", true));
                break;
            case "expired":
                constraints.push(where("expiredAt", "<=", now));
                break;
        }
    }

    // Search filter
    if (search) {
        constraints.push(
            where("slug", ">=", search),
            where("slug", "<=", search + "\uf8ff"),
        );
    }

    // Order handling: if search filter is applied, order by slug for range queries; otherwise order by createdAt desc
    if (search) {
        // Firestore requires ordering by the field used in range filter first
        constraints.push(orderBy("slug", "asc"));
    } else {
        constraints.push(orderBy("createdAt", "desc"));
    }
    // Pagination: if a last document snapshot is provided, continue after it
    if (lastDoc) {
        constraints.push(startAfter(lastDoc));
    }
    constraints.push(limit(pageSize));

    const q = query(collection(db, COLLECTION_NAME), ...constraints);
    const snapshot = await getDocs(q);

    const links = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Link[];

    const lastVisible =
        snapshot.docs.length > 0
            ? snapshot.docs[snapshot.docs.length - 1]
            : null;

    // Get total count
    const countQuery = query(collection(db, COLLECTION_NAME));
    const countSnapshot = await getDocs(countQuery);

    return {
        links,
        lastDoc: lastVisible,
        total: countSnapshot.size,
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
