<?php

namespace App\Entity;

use App\Repository\BudgetRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: BudgetRepository::class)]
class Budget
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column]
    private ?float $max_value = null;

    #[ORM\Column]
    private ?float $current_value = null;

    #[ORM\ManyToOne(inversedBy: 'budgets')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Travel $travel = null;

    #[ORM\OneToMany(mappedBy: 'budget', targetEntity: Expense::class, orphanRemoval: true)]
    private Collection $expenses;

    public function __construct()
    {
        $this->expenses = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getMaxValue(): ?float
    {
        return $this->max_value;
    }

    public function setMaxValue(float $max_value): self
    {
        $this->max_value = $max_value;

        return $this;
    }

    public function getCurrentValue(): ?float
    {
        return $this->current_value;
    }

    public function setCurrentValue(float $current_value): self
    {
        $this->current_value = $current_value;

        return $this;
    }

    public function getTravel(): ?Travel
    {
        return $this->travel;
    }

    public function setTravel(?Travel $travel): self
    {
        $this->travel = $travel;

        return $this;
    }

    /**
     * @return Collection<int, Expense>
     */
    public function getExpenses(): Collection
    {
        return $this->expenses;
    }

    public function addExpense(Expense $expense): self
    {
        if (!$this->expenses->contains($expense)) {
            $this->expenses->add($expense);
            $expense->setBudget($this);
        }

        return $this;
    }

    public function removeExpense(Expense $expense): self
    {
        if ($this->expenses->removeElement($expense)) {
            // set the owning side to null (unless already changed)
            if ($expense->getBudget() === $this) {
                $expense->setBudget(null);
            }
        }

        return $this;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->getId(),
            'name' => $this->getName(),
            'max_value' => $this->getMaxValue(),
            'current_value' => $this->getCurrentValue(),
            'travel' => $this->getTravel()->getId(),
        ];
    }

    public function updateCurrentValue(): self
    {
        $current_value = 0;

        /** @var Expense $expense */
        foreach ($this->getExpenses() as $expense) {
            $current_value += $expense->getValue();
        }

        $this->setCurrentValue($current_value);

        return $this;
    }
}
