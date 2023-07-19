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

    #[ORM\ManyToOne(inversedBy: 'travels')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $image = null;

    #[ORM\Column(nullable: true)]
    private ?array $travelers = [];

    #[ORM\OneToMany(mappedBy: 'travel', targetEntity: Budget::class, orphanRemoval: true)]
    private Collection $budgets;

    public function __construct()
    {
        $this->budgets = new ArrayCollection();
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

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

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
        if ($this->getImage() !== $this::DEFAULT_JPG) {
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
}
