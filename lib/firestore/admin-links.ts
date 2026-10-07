import { getAdminDb } from "@/lib/firebase/admin";
import { Link, CreateLinkInput } from "@/types/link";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

const COLLECTION_NAME = "links";

export async function adminCreateLink(input: CreateLinkInput): Promise<Link> {
    const db = getAdminDb();
    const docRef = db.collection(COLLECTION_NAME).doc(input.slug);
    const now = FieldValue.serverTimestamp();

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

    await docRef.set(linkData);

    return {
        id: input.slug,
        ...linkData,
        createdAt: new Date().toISOString(), // stub string for response mapping
        updatedAt: new Date().toISOString(),
    } as unknown as Link;
}

export async function adminGetLinkBySlug(slug: string): Promise<Link | null> {
    const db = getAdminDb();
    const docSnap = await db.collection(COLLECTION_NAME).doc(slug).get();

    if (!docSnap.exists) {
        return null;
    }

    return {
        id: docSnap.id,
        ...docSnap.data(),
    } as unknown as Link;
}

export async function adminGetLinkById(id: string): Promise<Link | null> {
    const db = getAdminDb();
    const docSnap = await db.collection(COLLECTION_NAME).doc(id).get();

    if (!docSnap.exists) {
        return null;
    }

    return {
        id: docSnap.id,
        ...docSnap.data(),
    } as unknown as Link;
}

export async function adminUpdateLink(
    id: string,
    input: Partial<Link>,
): Promise<void> {
    const db = getAdminDb();
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const updateData = {
        ...input,
        updatedAt: FieldValue.serverTimestamp(),
    };

    await docRef.update(updateData);
}

export async function adminDeleteLink(id: string): Promise<void> {
    const db = getAdminDb();
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    await docRef.delete();
}

export async function adminGetLinks(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: "active" | "inactive" | "suspended" | "expired";
}): Promise<{
    links: Link[];
    total: number;
}> {
    const { page = 1, limit: pageSize = 20, search, status } = options;

    const db = getAdminDb();
    const snapshot = await db.collection(COLLECTION_NAME).limit(pageSize).get();

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

export async function adminGetLinksCount(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    expired: number;
}> {
    const db = getAdminDb();
    const snapshot = await db.collection(COLLECTION_NAME).get();

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
