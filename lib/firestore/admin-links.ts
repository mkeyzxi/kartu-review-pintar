import { getAdminDb } from "@/lib/firebase/admin";
import { Link, CreateLinkInput } from "@/types/link";
import { FieldValue } from "firebase-admin/firestore";

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

