interface Menu {
    courses: Course[],
}

interface Course {
    diets: string[] | string;
    name: string,
    price: string;
}

export type {Menu};
