<?php

namespace App\Entity;

use App\Repository\TravelRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TravelRepository::class)]
class Travel
{
    const DEFAULT_JPG = "default.jpg";

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private array $steps = [];

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $image = null;

    #[ORM\Column(nullable: true)]
    private ?array $travelers = [];

    #[ORM\OneToMany(mappedBy: 'travel', targetEntity: Budget::class, orphanRemoval: true)]
    private Collection $budgets;

    #[ORM\ManyToMany(targetEntity: User::class, mappedBy: 'travels')]
    private Collection $users;

    public function __construct()
    {
        $this->budgets = new ArrayCollection();
        $this->users = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getSteps(): array
    {
        return $this->steps;
    }

    public function setSteps(array $steps): self
    {
        $this->steps = $steps;

        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getImage(): ?string
    {
        return $this->image;
    }

    public function setImage(?string $image = null): self
    {
        $this->image = $image ?? $this::DEFAULT_JPG;

        return $this;
    }

    public function deleteImage(string $folder): self
    {
        // Supprime l'image associée dans le dossier des images
        if ($this->getImage() !== $this::DEFAULT_JPG && file_exists($folder . $this->getImage())) {
            unlink($folder . $this->getImage());
        }

        return $this;
    }

    public function getTravelers(): ?array
    {
        return $this->travelers;
    }

    public function setTravelers(?array $travelers): self
    {
        $this->travelers = $travelers;

        return $this;
    }

    /**
     * @return Collection<int, Budget>
     */
    public function getBudgets(): Collection
    {
        return $this->budgets;
    }

    public function getArrayBudgets(): array
    {
        $budgets = [];

        foreach ($this->budgets as $budget) {
            array_push($budgets, $budget->toArray());
        }

        return $budgets;
    }

    public function addBudget(Budget $budget): self
    {
        if (!$this->budgets->contains($budget)) {
            $this->budgets->add($budget);
            $budget->setTravel($this);
        }

        return $this;
    }

    public function removeBudget(Budget $budget): self
    {
        if ($this->budgets->removeElement($budget)) {
            // set the owning side to null (unless already changed)
            if ($budget->getTravel() === $this) {
                $budget->setTravel(null);
            }
        }

        return $this;
    }

    public function getArrayExpenses(): array
    {
        $expenses = [];

        /** @var Budget $budget */
        foreach ($this->budgets as $budget) {
            /** @var Expense $expense */
            foreach ($budget->getExpenses() as $expense) {
                array_push($expenses, $expense->toArray());
            }
        }

        return $expenses;
    }

    public function getTotal(): array
    {
        $total = [];

        /** @var Budget $budget */
        foreach ($this->getBudgets() as $budget) {
            /** @var Expense $expense */
            foreach ($budget->getExpenses() as $expense) {
                if (key_exists('all', $total)) {
                    $total['all'] += $expense->getValue();
                } else {
                    $total['all'] = $expense->getValue();
                }
                if (key_exists($expense->getTraveler(), $total)) {
                    $total[$expense->getTraveler()] += $expense->getValue();
                } else {
                    $total[$expense->getTraveler()] = $expense->getValue();
                }
            }
        }

        return $total;
    }

    /**
     * @return Collection<int, User>
     */
    public function getUsers(): Collection
    {
        return $this->users;
    }

    public function addUser(User $user): self
    {
        if (!$this->users->contains($user)) {
            $this->users->add($user);
            $user->addTravel($this);
        }

        return $this;
    }

    public function removeUser(User $user): self
    {
        if ($this->users->removeElement($user)) {
            $user->removeTravel($this);
        }

        return $this;
    }
}
