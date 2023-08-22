<?php

namespace App\Controller;

use App\Entity\Travel;
use App\Entity\User;
use App\Repository\TravelRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class TravelController extends AbstractController
{
    #[Route('/travel/edit', name: 'app_edit_travel')]
    public function edit_travel(Request $request, TravelRepository $travelRepo): Response
    {
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

        /** @var User $user */
        $user = $this->getUser();

        if ($request->isMethod('POST')) {
            $formData = json_decode($request->getContent(), true);

            $order = json_decode($formData['steps_order'], true);

            $steps = [];

            for ($i = 0; $i < count($order); $i++) {
                [$day_id, $step_id] = explode("_", $order[$i]);

                $step_number = str_replace('step', '', $step_id);
                $date = $formData['date' . str_replace('day', '', $day_id)];

                $step = [
                    'name' => $formData[$day_id . '_name' . $step_number],
                    'place' => $formData[$day_id . '_place' . $step_number],
                    'lat' => $formData[$day_id . '_lat' . $step_number],
                    'lng' => $formData[$day_id . '_lng' . $step_number],
                    'url' => $formData[$day_id . '_url' . $step_number],
                    'desc' => $formData[$day_id . '_desc' . $step_number],
                ];

                if (key_exists($date, $steps)) {
                    array_push($steps[$date], $step);
                } else {
                    $step['home'] = $formData[$day_id . '_home'];
                    $steps[$date] = [$step];
                }
            }

            if ($travel_id = $formData['travel_id']) {
                // Mise à jour d'un voyage existant
                $travel = $travelRepo->find($travel_id);
            } else {
                // Création d'un nouveau voyage
                $travel = new Travel();
                $travel->setImage(null);
                $travel->addUser($user);
            }

            $travel->setName($formData['travel_name']);
            $travel->setSteps($steps);
            $travelRepo->save($travel, true);

            return new JsonResponse(['travel_id' => $travel->getId()]);
        }

        $id = 0;
        $name = "";
        $steps = [];

        if ($travel_id = $request->get('id')) {
            $travel = $travelRepo->find($travel_id);
            $id = $travel->getId();
            $name = $travel->getName();
            $steps = $travel->getSteps();
        }

        return $this->render('travel/edit_travel.html.twig', [
            'id' => $id,
            'name' => $name,
            'steps' => $steps,
        ]);
    }

    #[Route('/travels', name: 'app_travels')]
    public function travels(TravelRepository $travelRepo): Response
    {
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

        /** @var User $user */
        $user = $this->getUser();

        $data = $travelRepo->findByUser($user);

        return $this->render('travel/travels.html.twig', [
            'data' => $data,
        ]);
    }

    #[Route('/travel/play', name: 'app_play_travel')]
    public function play_travel(Request $request, TravelRepository $travelRepo): Response
    {
        if ($travel_id = $request->get('id')) {
            $travel = $travelRepo->find($travel_id);
        }

        return $this->render('travel/play_travel.html.twig', [
            'id' => $travel_id,
            'name' => $travel->getName(),
            'steps' => $travel->getSteps(),
        ]);
    }

    #[Route('/travel/delete', name: 'app_delete_travel')]
    public function delete_travel(Request $request, TravelRepository $travelRepo): Response
    {
        $data = json_decode($request->getContent(), true);

        if ($travel_id = $data['id']) {
            $travel = $travelRepo->find($travel_id);
            $travel->deleteImage($this->getParameter('images_dir'));
            // Supprimer le voyage en base
            $travelRepo->remove($travel, true);
        }

        return new JsonResponse([
            'ok' => 'true'
        ]);
    }

    #[Route('/image/save', name: 'app_save_image')]
    public function save_image(Request $request, TravelRepository $travelRepo)
    {
        $travel = $travelRepo->find($request->request->get('travel_id'));
        $travel->deleteImage($this->getParameter('images_dir'));

        $filename = hash("md5", $travel->getName() . uniqid()) . '.jpg';
        $file = $request->files->get('blob');

        $info = getimagesize($file);

        switch ($info['mime']) {
            case 'image/jpeg':
                $image = imagecreatefromjpeg($file);
                break;
            case 'image/png':
                $image = imagecreatefrompng($file);
        }

        imagejpeg($image, $this->getParameter('images_dir') . $filename, 60);

        $travel->setImage($filename);
        $travelRepo->save($travel, true);

        return new Response();
    }
}
