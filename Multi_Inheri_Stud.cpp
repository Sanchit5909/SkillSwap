#include <iostream>
using namespace std;

class Student
{
public:
    int roll;
    string name;

    void getStudent()
    {
        cout << "Enter Roll No: ";
        cin >> roll;
        cout << "Enter Name: ";
        cin >> name;
    }
};

class StudentExam : public Student
{
public:
    int m1, m2, m3, m4, m5;

    void getMarks()
    {
        cout << "Enter marks of 5 Subjects: ";
        cin >> m1 >> m2 >> m3 >> m4 >> m5;
    }
};

class StudentResult : public StudentExam
{
public:
    void display()
    {
        int total = m1 + m2 + m3 + m4 + m5;
        float percentage = (total / 500.0) * 100;

        cout << "\nRoll No: " << roll;
        cout << "\nName: " << name;
        cout << "\nTotal Marks: " << total << "/500";
        cout << "\nPercentage: " << percentage << "%";
    }
};

int main()
{
    StudentResult s;

    s.getStudent();
    s.getMarks();
    s.display();

    return 0;
}